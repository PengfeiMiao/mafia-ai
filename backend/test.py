from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

model = ChatOpenAI(
    model="gpt-3.5-turbo",
    base_url="https://oneapi.xty.app/v1/",
    api_key="sk-PW4WUqvL8tBcXmRmB9Dc2574D0794dC19fEe4626225d968b",
)

parser = StrOutputParser()

system_template = "Translate the following into {language}:"

prompt_template = ChatPromptTemplate.from_messages(
    [("system", system_template), ("user", "{text}")]
)

chain = prompt_template| model | parser

result = chain.invoke({"language": "italian", "text": "hi"})
print(result)
