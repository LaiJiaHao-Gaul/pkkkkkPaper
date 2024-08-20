# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
import torch
from transformers import pipeline
import os
from tensorflow import keras
import tensorflow as tf

app = Flask(__name__)

# 设置模型路径
# style_model_path = '/Users/coco/Downloads/learning_chatbot/models/model_Doc2Vec.h5'
style_model_path = '../../models/model_Doc2Vec.h5'
qa_model_dir = '../../models/qa_model'

# 加载模型
style_model = tf.compat.v1.keras.models.load_model(style_model_path)
print("学习风格模型已成功加载")
qa_pipeline = pipeline('question-answering', model='gpt2')

@app.route('/predict_style', methods=['POST'])
def predict_style():
    data = request.json
    question = data.get('question')
    
    # 使用学习风格分类模型对问题进行分类
    # 假设模型返回三个分数 [V, A, K]
    style_scores = style_model.predict([question])
    
    return jsonify({
        'V': style_scores[0],
        'A': style_scores[1],
        'K': style_scores[2]
    })

@app.route('/answer_question', methods=['POST'])
def answer_question():
    data = request.json
    question = data.get('question')
    
    # 使用问答模型生成答案
    answer = qa_model({'question': question, 'context': 'relevant_context'})
    
    return jsonify({
        'answer': answer['answer']
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)