class ILSAssessment:
    def __init__(self):
        pass

    def analyze_ils(self, answers):
        learning_style = {
            "Sensory/Intuitive": 0,
            "Visual/Verbal": 0,
            "Active/Reflective": 0,
            "Sequential/Global": 0
        }
        for i, answer in enumerate(answers):
            if answer == 'a':
                if i % 11 == 0:
                    learning_style["Sensory/Intuitive"] += 1
                elif i % 11 == 1:
                    learning_style["Visual/Verbal"] += 1
                elif i % 11 == 2:
                    learning_style["Active/Reflective"] += 1
                elif i % 11 == 3:
                    learning_style["Sequential/Global"] += 1
            elif answer == 'b':
                if i % 11 == 0:
                    learning_style["Sensory/Intuitive"] -= 1
                elif i % 11 == 1:
                    learning_style["Visual/Verbal"] -= 1
                elif i % 11 == 2:
                    learning_style["Active/Reflective"] -= 1
                elif i % 11 == 3:
                    learning_style["Sequential/Global"] -= 1
        return learning_style
