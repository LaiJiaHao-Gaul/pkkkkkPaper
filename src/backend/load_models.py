from flask import Flask, request, jsonify
import torch
from transformers import pipeline
import os
from tensorflow import keras
import tensorflow as tf
import spacy
import numpy as np
import re
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
from sklearn.preprocessing import LabelEncoder


app = Flask(__name__)

# 设置模型路径
style_model_path = '../../models/model_Doc2Vec.h5'
#qa_model_dir = '/Users/coco/Downloads/learning_chatbot/models/qa_model'

# 加载模型
style_model = tf.compat.v1.keras.models.load_model(style_model_path)
print("学习风格模型已成功加载")
#qa_pipeline = pipeline('question-answering', model=qa_model_dir)

nlp = spacy.load('en_core_web_sm')
tokenizer = Tokenizer()
label_enc = LabelEncoder()
label_enc.classes_ = np.array(['Auditory', 'Kinesthetic', 'Visual'])  # 根据你的类别名称设置


# 定义清理文本的函数
def clean_text(text):
    text = re.sub(r"https?://\S+|www\.\S+", "", text)  # 移除 URL
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  # 移除标点符号
    text = text.lower()  # 转为小写
    text = ' '.join(text.split())  # 移除多余空格
    return text

# 定义预测函数
def predict_style(question):
    # 清理并预处理文本
    cleaned_sentence = ' '.join([token.lemma_ for token in nlp(clean_text(question)) if not token.is_stop])

    # 将句子转换为模型可接受的格式
    sequence = tokenizer.texts_to_sequences([cleaned_sentence])
    padded_sequence = pad_sequences(sequence, maxlen=200)  # 假设模型输入的最大长度是200

    # 进行预测
    pred = style_model.predict(padded_sequence)

    # 生成返回结果
    result = {style: float(pred[0][idx]) for idx, style in enumerate(label_enc.classes_)}
    return result

@app.route('/predict_style', methods=['POST'])
def predict_style_route():
    try:
        data = request.json
        question = data.get('question')
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # 调用预测函数
        style_scores = predict_style(question)
        return jsonify(style_scores)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Failed to get style prediction from model.'}), 500


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