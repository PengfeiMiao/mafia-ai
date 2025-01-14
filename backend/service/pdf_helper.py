import logging

# import PyPDF2
import pdfplumber

from ..entity.question import Question

logging.basicConfig(level=logging.WARNING)


class PDFHelper:
    def __init__(self, question_regex: [], option_regex: []):
        try:
            self.question_regex = question_regex
            self.option_regex = option_regex
        except Exception as e:
            logging.error(f"Failed: {e}")
            # sys.exit(1)

    def load_file(self, file_path):
        questions = []
        # 打开 PDF 文件
        # with open(file_path, 'rb') as file:
        #     # 创建一个 PDF Reader 对象
        #     pdf_reader = PyPDF2.PdfReader(file)
        #     # 获取 PDF 文档总页数
        #     num_pages = len(pdf_reader.pages)
        index = 0
        with pdfplumber.open(file_path) as pdf:
            print(f'总页数: {len(pdf.pages)}')
            # 遍历每一页并提取文本内容
            for page_num, page in zip(range(len(pdf.pages)), pdf.pages):
                text = page.extract_text().replace('\x00', 'fi-')
                print('page_num:', page_num)
                qoa_list = self.question_regex[0].findall(text)
                for qoa in qoa_list:
                    option_list = self.option_regex[0].findall(qoa[2])
                    options = {}
                    for option in option_list:
                        options[option[0]] = option[1].replace('\n', ' ')
                    question = Question(qoa[1].replace('\n', ' '), options, qoa[3], qoa[4], 1, '', 1)
                    index += 1
                    # print('index', index, '\nquestion', question.to_dict())
                    questions.append(question)

        return questions
