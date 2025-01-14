# import logging
#
# import pdfplumber
#
# logging.basicConfig(level=logging.WARNING)
#
#
# class PDFHelper:
#     def __init__(self, question_regex: [], option_regex: []):
#         try:
#             self.question_regex = question_regex
#             self.option_regex = option_regex
#         except Exception as e:
#             logging.error(f"Failed: {e}")
#             # sys.exit(1)
#
#     def load_file(self, file_path):
#         contents = []
#         index = 0
#         with pdfplumber.open(file_path) as pdf:
#             print(f'总页数: {len(pdf.pages)}')
#             # 遍历每一页并提取文本内容
#             for page_num, page in zip(range(len(pdf.pages)), pdf.pages):
#                 text = page.extract_text().replace('\x00', 'fi-')
#                 print('page_num:', page_num)
#                 print('text:', text)
#                 index+=1
#
#         return contents
