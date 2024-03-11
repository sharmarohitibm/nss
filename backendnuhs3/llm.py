import os
import re
import requests
import torch

import warnings
warnings.filterwarnings("ignore")

import numpy as np
# import matplotlib.pyplot as plt

# from langchain.document_loaders import PyPDFLoader
from langchain_community.document_loaders import PyPDFLoader
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
from typing import Literal, Optional, Any

from ibm_watson_machine_learning.foundation_models.extensions.langchain import WatsonxLLM
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from ibm_watson_machine_learning.foundation_models.utils.enums import ModelTypes
from ibm_watson_machine_learning.foundation_models.utils.enums import DecodingMethods
from ibm_watson_machine_learning.foundation_models import Model
from langchain import PromptTemplate
from langchain.chains import LLMChain
from langchain.chains import SimpleSequentialChain
from langchain.chains import ConversationChain
from langchain.chains.conversation.memory import ConversationBufferMemory

# Load the model from TF Hub
class MiniLML6V2EmbeddingFunction():
    MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    def __call__(self, texts):
        return MiniLML6V2EmbeddingFunction.MODEL.encode(texts).tolist()
emb_function = MiniLML6V2EmbeddingFunction()

def pdf_to_text(path: str,
                start_page: int = 1,
                end_page: Optional[int | None] = None) -> list[str]:
  """
  Converts PDF to plain text.

  Args:
      path (str): Path to the PDF file.
      start_page (int): Page to start getting text from.
      end_page (int): Last page to get text from.
  """
  loader = PyPDFLoader(path)
  pages = loader.load()
  total_pages = len(pages)

  if end_page is None:
      end_page = len(pages)

  text_list = []
  for i in range(start_page-1, end_page):
      text = pages[i].page_content
      text = text.replace('\n', ' ')
      text = re.sub(r'\s+', ' ', text)
      text_list.append(text)

  return text_list

def text_to_chunks(texts: list[str],
                   word_length: int = 150,
                   start_page: int = 1) -> list[list[str]]:
  """
  Splits the text into equally distributed chunks.

  Args:
      texts (str): List of texts to be converted into chunks.
      word_length (int): Maximum number of words in each chunk.
      start_page (int): Starting page number for the chunks.
  """
  text_toks = [t.split(' ') for t in texts]
  chunks = []

  for idx, words in enumerate(text_toks):
      for i in range(0, len(words), word_length):
          chunk = words[i:i+word_length]
          if (i+word_length) > len(words) and (len(chunk) < word_length) and (
              len(text_toks) != (idx+1)):
              text_toks[idx+1] = chunk + text_toks[idx+1]
              continue
          chunk = ' '.join(chunk).strip()
          chunk = f'[Page no. {idx+start_page}]' + ' ' + '"' + chunk + '"'
          chunks.append(chunk)

  return chunks

def get_text_embedding(texts: list[list[str]],
                       batch: int = 1000) -> list[Any]:
  """
  Get the embeddings from the text.

  Args:
      texts (list(str)): List of chucks of text.
      batch (int): Batch size.
  """
  embeddings = []
  for i in range(0, len(texts), batch):
      text_batch = texts[i:(i+batch)]
      # Embeddings model
      emb_batch = emb_function(text_batch)
      embeddings.append(emb_batch)
  embeddings = np.vstack(embeddings)
  return embeddings

def get_search_results(question, embeddings, chunks):
  """
  Get best search results
  """
  emb_question = emb_function([question])
  nn = NearestNeighbors(n_neighbors=5)
  nn.fit(embeddings)
  neighbors = nn.kneighbors(emb_question, return_distance=False)
  topn_chunks = [chunks[i] for i in neighbors.tolist()[0]]

  return topn_chunks

def build_prompt(question, topn_chunks_for_prompts):

  '''
  build prompt for general Q&A
  '''

#   prompt = ""
#   prompt += 'Search results:\n'

#   for c in topn_chunks_for_prompts:
#       prompt += c + '\n\n'
  
  prompt = "Reply to the" + question

#   prompt += f"\n\n\nQuery: {question}\n\nAnswer: "

  return prompt

# Get embedding
input_file_path = "Alexandra Hospital Programmes.pdf"
text_list = pdf_to_text(input_file_path)
chunks = text_to_chunks(text_list)
embeddings = get_text_embedding(chunks)

parameters = {
    GenParams.DECODING_METHOD: DecodingMethods.SAMPLE,
    GenParams.MAX_NEW_TOKENS: 1000,
    GenParams.MIN_NEW_TOKENS: 1,
    GenParams.TEMPERATURE: 0.5,
    GenParams.TOP_K: 50,
    GenParams.TOP_P: 1
}

model_id = ModelTypes.LLAMA_2_13B_CHAT

credentials = {
    "url": "https://us-south.ml.cloud.ibm.com",
    "apikey": "NN-whoB7_lLfS4A3QMCfQCNUNup9pB7YiCRSTi7apqN-"}


llama2_13b_chat_model = Model(
    model_id=model_id,
    params=parameters,
    credentials=credentials,
    project_id="86f6a771-5f44-49cd-a7ab-1b6fe6091493")

llama2_13b_chat_llm = WatsonxLLM(model=llama2_13b_chat_model)

conversation_buf = ConversationChain(
    llm=llama2_13b_chat_llm,
    memory=ConversationBufferMemory()
)

def llm_answer(query):
    question = query
    topn_chunks = get_search_results(question, embeddings, chunks)
    prompt = build_prompt(question, topn_chunks)

    output = conversation_buf.run(prompt)
    return output