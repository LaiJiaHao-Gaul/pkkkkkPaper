import os
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, Trainer, TrainingArguments
from datasets import load_dataset, concatenate_datasets
import evaluate
import torch
from torch.utils.data import DataLoader

class ModelTrainer:
    def __init__(self, dataset_names):
        self.model_name = "bert-base-uncased"
        self.model = AutoModelForQuestionAnswering.from_pretrained(self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.dataset_names = dataset_names
        self.dataset = self.load_and_combine_datasets()
        self.metric = evaluate.load("squad")

    def load_and_combine_datasets(self):
        datasets = [load_dataset(name, trust_remote_code=True) for name in self.dataset_names]
        # 打印每个数据集的键
        for dataset in datasets:
            print(dataset.keys())
        
        # 假设所有数据集都包含 'test' 键
        combined_dataset = concatenate_datasets([dataset['test'] for dataset in datasets])
        return combined_dataset

    def preprocess_data(self, examples):
        questions = examples["question"]
        contexts = [" ".join(context) if isinstance(context, list) else str(context) for context in examples["choices"]]
        answers = examples["answer"]

        # 调试打印
        print("Questions:", questions[:5])  # 仅打印前5个样本
        print("Contexts:", contexts[:5])
        print("Answers:", answers[:5])

        # 标记化问题和上下文
        inputs = self.tokenizer(
            questions,
            contexts,
            max_length=384,
            truncation=True,
            padding="max_length",
        )

        # 编码答案
        labels = []
        for answer in answers:
            label = self.tokenizer(
                answer, 
                max_length=384, 
                truncation=True, 
                padding="max_length"
            )
            labels.append(label['input_ids'])
        
        inputs["labels"] = torch.tensor(labels)
        return inputs

    def compute_metrics(self, p):
        return self.metric.compute(predictions=p.predictions, references=p.label_ids)

    def fine_tune_model(self):
        training_args = TrainingArguments(
            output_dir="./qa_finetuned_model",
            per_device_train_batch_size=8,
            num_train_epochs=2,
            evaluation_strategy="steps",
            eval_steps=1000,
            save_steps=1000,
        )
        tokenized_datasets = self.dataset.map(self.preprocess_data, batched=True)
        train_dataloader = DataLoader(tokenized_datasets, batch_size=8, shuffle=True)

        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=tokenized_datasets,
            tokenizer=self.tokenizer,
            compute_metrics=self.compute_metrics,
        )
        trainer.train()
        trainer.save_model("./qa_finetuned_model")

    def reinforcement_learning(self, feedback_data):
        # 实现强化学习逻辑
        pass

if __name__ == "__main__":
    dataset_names = [
        "joey234/mmlu-high_school_geography-neg",
        "joey234/mmlu-high_school_geography-rule-neg",
        "joey234/mmlu-high_school_geography-original-neg"
        # 添加其他数据集名称
    ]
    trainer = ModelTrainer(dataset_names=dataset_names)
    trainer.fine_tune_model()
