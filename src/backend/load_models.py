
from flask import Flask, request, jsonify
import torch
from transformers import pipeline
import os
from tensorflow import keras
import tensorflow as tf
import spacy
import numpy as np
import re
import random
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
from sklearn.preprocessing import LabelEncoder

import subprocess
import json
import joblib



app = Flask(__name__)

# 设置模型路径

#qa_model_dir = '/Users/coco/Downloads/learning_chatbot/models/qa_model'
vectorizer = joblib.load('../../models/tfidf_vectorizer.pkl')
label_encoder = joblib.load('../../models/label_encoder.pkl')

# 加载模型
stacking_clf= joblib.load('../../models/stacking_model.pkl')

print("学习风格模型已成功加载")

# 加载情绪分析模型
emo_rf_model= joblib.load('../../models/emo_rf_model.pkl')
label_encoder_emo = joblib.load('../../models/label_encoder.joblib')
vectorizer_emo = joblib.load('../../models/emotfidf_vectorizer.joblib')

print("情绪分析模型已成功加载")

def clean_text(text):
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower().strip()
    return text

# 定义预测函数
def predict_style(sentence):
    # 清理并预处理文本
    test_features = vectorizer.transform([sentence])

    # 使用加载的分类器进行预测
    probas_rf = stacking_clf.predict_proba(test_features)

    # 输出每个句子的学习风格比例
    result = {label_encoder.classes_[j]: float(probas_rf[0][j]) for j in range(len(label_encoder.classes_))}
    return result



#情绪分析模型
def get_emotion(sentence):
    cleaned_text = clean_text(sentence)
    
    # Step 2: Transform the cleaned text using the loaded TF-IDF vectorizer
    test_features = vectorizer_emo.transform([cleaned_text])
    
    # Step 3: Predict the emotion using the loaded model
    y_pred = emo_rf_model.predict(test_features)
    
        # Step 4: Convert the prediction to a sentiment label
    predicted_sentiment = label_encoder_emo.inverse_transform(y_pred)

    return predicted_sentiment[0]
    

@app.route('/predict_style', methods=['POST'])
def predict_style_route():
    try:
        data = request.json
        question = data.get('question')
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # 调用预测函数
        style_scores = predict_style(question)
        emotion_scores = get_emotion(question)
        print('style_scores_model',style_scores)
        print('emotion_scores_model',emotion_scores)
        print('style_scores',style_scores)
        return jsonify({'style_scores':style_scores,'emotion_scores':emotion_scores})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Failed to get style prediction from model.'}), 500
    

def run_mab_js(chosen_arm=None, reward=None):
    try:
        if chosen_arm is not None and reward is not None:
            result = subprocess.run(
                ['node', './utils/mab.js', str(chosen_arm), str(reward)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        else:
            result = subprocess.run(
                ['node', './utils/mab.js'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        if result.returncode == 0:
            output = result.stdout.decode('utf-8')
            data = json.loads(output)
            return data
        else:
            print("Error running JavaScript file:", result.stderr.decode('utf-8'))
            return None
    except Exception as e:
        print("An error occurred:", e)
        return None

#没用到的代码 可删
# def update_mab_js(chosen_arm, reward):
#     try:
#         # 运行 JavaScript 文件并传递参数来更新 MAB
#         result = subprocess.run(
#             ['node', './utils/mab.js', str(chosen_arm), str(reward)], 
#             stdout=subprocess.PIPE, 
#             stderr=subprocess.PIPE
#         )
        
#         if result.returncode == 0:
#             print("MAB updated successfully.")
            
#         else:
#             print("Error updating MAB:", result.stderr.decode('utf-8'))
#     except Exception as e:
#         print("An error occurred while updating MAB:", e)

def calculate_reward(feedback, sentiment):
    reward = 0
    if feedback == 'like':
        reward += 1
    elif feedback == 'dislike':
        reward -= 1
    reward += sentiment  # -1, 0, 1 based on sentiment
    return reward




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
