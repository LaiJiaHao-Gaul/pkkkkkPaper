# Import Library
import numpy as np
import pandas as pd
import re
import spacy
from collections import Counter
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from gensim.models import Doc2Vec
from sklearn import utils
import gensim
from gensim.models.doc2vec import TaggedDocument
from tqdm import tqdm
import tensorflow as tf
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.layers import LSTM  
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# 确保 spacy 模型已下载
# python -m spacy download en_core_web_sm


print(tf.__version__)
print(keras.__version__)

# Read Data
df = pd.read_csv('/Users/coco/Downloads/learning_chatbot/data/dataset.csv')
df.head()
print(f'There are {df.shape[0]} rows and {df.shape[1]} columns')
df.describe()
temp = df.groupby('Type').count()['Sentence'].reset_index().sort_values(by='Sentence',ascending=False)
temp.style.background_gradient(cmap='Purples')
# Data Cleaning
df.isnull().sum()
df['Sentence'].duplicated().sum()
duplicateRows = df[df.duplicated()]
duplicateRows
df.drop_duplicates(inplace=True,keep=False)
df.shape
temp = df.groupby('Type').count()['Sentence'].reset_index().sort_values(by='Sentence',ascending=False)
temp.style.background_gradient(cmap='Purples')
df.head()
nlp = spacy.load('en_core_web_sm')
df['Sentence_modified'] = df['Sentence'].apply(lambda x: [doc.lemma_ for doc in  nlp(x) if not doc.is_stop])
df['Sentence_modified'] = df['Sentence_modified'].apply(lambda x: " ".join(x))
df.head()
def clean_text(text):
    text = re.sub(r"https?://\w+\.\w+\.\w+", "", text).lower()
    text = re.sub(r'[^a-zA-Z0-9]', ' ', text)
    text = text.replace(".", " " )
    text = text.replace(",", " " )
    text = text.replace("-", " " )
    text = text.replace(r'\s+', ' ')
    return text
df['Sentence_modified'] = df['Sentence_modified'].apply(clean_text)
df.head()
# Exploration Data Analysis
df_Auditory = df[df['Type'] == 'Auditory']
df_Visual = df[df['Type'] == 'Visual']
df_Kinesthetic = df[df['Type'] == 'Kinesthetic']
all_most_frequent_world = Counter(" ".join(df["Sentence_modified"]).split()).most_common(50)
all_most_frequent_world
Auditory_most_frequent_world = Counter(" ".join(df_Auditory["Sentence_modified"]).split()).most_common(50)
Auditory_most_frequent_world
Visual_most_frequent_world = Counter(" ".join(df_Visual["Sentence_modified"]).split()).most_common(50)
Visual_most_frequent_world
Kinesthetic_most_frequent_world = Counter(" ".join(df_Kinesthetic["Sentence_modified"]).split()).most_common(50)
Kinesthetic_most_frequent_world
# to list of world
all_most_frequent_world = [list(ele)[0] for ele in all_most_frequent_world]
Auditory_most_frequent_world = [list(ele)[0] for ele in Auditory_most_frequent_world]
Visual_most_frequent_world = [list(ele)[0] for ele in Visual_most_frequent_world]
Kinesthetic_most_frequent_world = [list(ele)[0] for ele in Kinesthetic_most_frequent_world]
wordcloud = WordCloud(background_color='white',colormap='Dark2', max_font_size=150, random_state=42,width=800, height=400).generate(" ".join(all_most_frequent_world))
plt.title("All Taype")
plt.imshow(wordcloud, interpolation='bilinear')
plt.show()

wordcloud = WordCloud(background_color='white',colormap='Dark2', max_font_size=150, random_state=42,width=800, height=400).generate(" ".join(Auditory_most_frequent_world))
plt.title("Auditory")
plt.imshow(wordcloud, interpolation='bilinear')
plt.show()

wordcloud = WordCloud(background_color='white',colormap='Dark2', max_font_size=150, random_state=42,width=800, height=400).generate(" ".join(Visual_most_frequent_world))
plt.title("Visual")
plt.imshow(wordcloud, interpolation='bilinear')
plt.show()

wordcloud = WordCloud(background_color='white',colormap='Dark2', max_font_size=150, random_state=42,width=800, height=400).generate(" ".join(Kinesthetic_most_frequent_world))
plt.title("Kinesthetic")
plt.imshow(wordcloud, interpolation='bilinear')
plt.show()
# Feature And Target
X = df['Sentence_modified']
y = df['Type']

label_enc = LabelEncoder()
y = label_enc.fit_transform(y)
y = to_categorical(y)
X.shape
X[:3]
print(label_enc.transform(label_enc.classes_))
print(list(label_enc.classes_))
y.shape
y
# Document To Vector
# Data Preprocessing (Doc2Vec)
tqdm.pandas(desc="progress-bar")

def label_sentences(StudentSentence, label_type):
    labeled = []
    for i, v in enumerate(StudentSentence):
        label = label_type + '_' + str(i)
        labeled.append(TaggedDocument(v.split(), [label]))
    return labeled 
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0, test_size=0.3)

X_train = label_sentences(X_train, 'Train')
X_test = label_sentences(X_test, 'Test')
all_data = X_train + X_test
all_data[0:2]
model_dbow = Doc2Vec(dm=0, vector_size=50, negative=5, min_count=1, alpha=0.065, min_alpha=0.065)
model_dbow.build_vocab([x for x in tqdm(all_data)])

for epoch in range(30):
    model_dbow.train(utils.shuffle([x for x in tqdm(all_data)]), total_examples=len(all_data), epochs=1)
    model_dbow.alpha -= 0.002
    model_dbow.min_alpha = model_dbow.alpha
def get_vectors(model, corpus_size, vectors_size, vectors_type):
    """
    Get vectors from trained doc2vec model
    :param doc2vec_model: Trained Doc2Vec model
    :param corpus_size: Size of the data
    :param vectors_size: Size of the embedding vectors
    :param vectors_type: Training or Testing vectors
    :return: list of vectors
    """
    vectors = np.zeros((corpus_size, vectors_size))
    for i in range(0, corpus_size):
        prefix = vectors_type + '_' + str(i)
        vectors[i] = model.docvecs[prefix]
    return vectors
    
train_vectors_dbow = get_vectors(model_dbow, len(X_train), 50, 'Train')
test_vectors_dbow = get_vectors(model_dbow, len(X_test), 50, 'Test')
train_vectors_dbow.shape
test_vectors_dbow.shape
y_test.shape
test_vectors_dbow[:1]
# Build And Feed The Model (Doc2Vec)
Early_stoping = tf.keras.callbacks.EarlyStopping(
    min_delta=0.001,
    patience=20,
    restore_best_weights=True,
)
model_1 = tf.keras.models.Sequential([
    tf.keras.layers.Input((50, 1)),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True)),  # 替换 CuDNNLSTM 为 LSTM
    tf.keras.layers.GlobalMaxPool1D(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(3, activation='softmax')
])

model_1.compile(loss='categorical_crossentropy',
                optimizer=tf.keras.optimizers.Adam(),
                metrics=['accuracy'])

model_1.summary()
history_1 = model_1.fit(train_vectors_dbow,
          y_train,
          validation_data=(test_vectors_dbow, y_test),
          batch_size=64,
          epochs=100,
          callbacks=[Early_stoping])
# Model Evaluation (Doc2Vec)
acc = history_1.history['accuracy']
val_acc = history_1.history['val_accuracy']
loss = history_1.history['loss']
val_loss = history_1.history['val_loss']

epochs = range(len(acc))

plt.plot(epochs, acc, 'g', label='Training accuracy')
plt.plot(epochs, val_acc, 'b', label='Validation accuracy')
plt.title('Training and validation accuracy')
plt.legend()
plt.figure()

plt.plot(epochs, loss, 'g', label='Training Loss')
plt.plot(epochs, val_loss, 'b', label='Validation Loss')
plt.title('Training and validation loss')
plt.legend()

plt.show()
loss, acc=model_1.evaluate(test_vectors_dbow, y_test, verbose=1)
print (f"Test Accuracy = {round(acc,2)} %")
y_pred_1 = model_1.predict(test_vectors_dbow)
y_pred_1
y_pred_1 = np.argmax(y_pred_1, axis=1)
y_test=np.argmax(y_test, axis=1)
print(classification_report(y_test, y_pred_1, target_names=label_enc.classes_))
#model_save_dir = '/Users/coco/Downloads/learning_chatbot/models/'
#model_save_path = os.path.join(model_save_dir, 'model_Doc2Vec')

# 保存为 TensorFlow SavedModel 格式
# 保存为 HDF5 格式
model_1.save('/Users/coco/Downloads/learning_chatbot/models/model_Doc2Vec.h5')
print(tf.__version__)
print(keras.__version__)
# Word Embedding
# Data Preprocessing (Word Embedding)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0, test_size=0.3)
# Tokenize words
tokenizer = Tokenizer()
tokenizer.fit_on_texts(X_train)
sequences_train = tokenizer.texts_to_sequences(X_train)
sequences_test = tokenizer.texts_to_sequences(X_test)
X_train = pad_sequences(sequences_train, maxlen=48, truncating='pre')
X_test = pad_sequences(sequences_test, maxlen=48, truncating='pre')

vocabSize = len(tokenizer.index_word) + 1
print(f"Vocabulary Size = {vocabSize}")
X_train.shape
y_train.shape
X_test.shape
y_test.shape
# Build And Feed The Model (Word Embedding)
Early_stoping = tf.keras.callbacks.EarlyStopping(
    min_delta=0.001,
    patience=20,
    restore_best_weights=True,
)
model_2 = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(X_train.shape[1],)),  # 添加 Input 层，指定输入形状
    tf.keras.layers.Embedding(vocabSize, 200),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True)),
    tf.keras.layers.GlobalMaxPool1D(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(3, activation='softmax')
])

model_2.compile(loss='categorical_crossentropy',
                optimizer=tf.keras.optimizers.Adam(),
                metrics=['accuracy'])

model_2.build(input_shape=(None, X_train.shape[1]))

model_2.summary()
history_2 = model_2.fit(X_train,
          y_train,
          validation_data=(X_test, y_test),
          batch_size=64,
          epochs=100,
          callbacks=[Early_stoping])
# Model Evaluation (Word Embedding)
acc = history_2.history['accuracy']
val_acc = history_2.history['val_accuracy']
loss = history_2.history['loss']
val_loss = history_2.history['val_loss']

epochs = range(len(acc))

plt.plot(epochs, acc, 'g', label='Training accuracy')
plt.plot(epochs, val_acc, 'b', label='Validation accuracy')
plt.title('Training and validation accuracy')
plt.legend()
plt.figure()

plt.plot(epochs, loss, 'g', label='Training Loss')
plt.plot(epochs, val_loss, 'b', label='Validation Loss')
plt.title('Training and validation loss')
plt.legend()

plt.show()
y_test
loss, acc=model_2.evaluate(X_test, y_test, verbose=1)
print (f"Test Accuracy = {round(acc,2)} %")
y_pred_2 = model_2.predict(X_test)
y_pred_2
y_pred_2 = np.argmax(y_pred_2, axis=1)
y_test=np.argmax(y_test, axis=1)
print(classification_report(y_test, y_pred_2, target_names=label_enc.classes_))
#model_2.save('model_WordEmbedding.h5')
model_save_path = os.path.join(model_save_dir, 'model_WordEmbedding.keras')
model_2.save(model_save_path)
import spacy
import numpy as np

# 加载SpaCy模型
nlp = spacy.load('en_core_web_sm')

model = model_1  # 你之前训练的模型
tokenizer = Tokenizer()

# 假设label_enc是之前训练中使用的LabelEncoder实例
label_enc = LabelEncoder()
label_enc.classes_ = np.array(['Auditory', 'Kinesthetic', 'Visual'])  # 你的类别名称，确保顺序与训练时相同

# 输入句子
input_sentence = "I learn best when i draw a picture."

# 使用之前定义的预处理函数
def clean_text(text):
    text = re.sub(r"https?://\S+|www\.\S+", "", text)  # Remove URLs
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  # Remove punctuation
    text = text.lower()  # Convert to lowercase
    text = ' '.join(text.split())  # Remove extra spaces
    return text

# 应用SpaCy的词形还原和停用词过滤
cleaned_sentence = ' '.join([token.lemma_ for token in nlp(clean_text(input_sentence)) if not token.is_stop])

# 将句子转换为模型可接受的格式
sequence = tokenizer.texts_to_sequences([cleaned_sentence])
padded_sequence = pad_sequences(sequence, maxlen=200)  # 假设模型输入的最大长度是200


# 进行预测
pred = model.predict(padded_sequence)

# 输出预测概率
for idx, style in enumerate(label_enc.classes_):
    print(f"Probability of '{style}': {pred[0][idx]:.2f}%")
