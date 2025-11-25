from google import genai
from google.genai import types
import dotenv
from dataclasses import dataclass, field
from typing import Literal
from app.lib.system_instruction import SYSTEM_INSTRUCTION

class EmpathicChatbotClient:

    @dataclass(frozen=True)
    class Request:
        message_history: list[dict[Literal["author", "content"], str]]
        code: str = ""
        instruction: str | None = None

    @dataclass(frozen=True)
    class Response:
        sentiment: Literal["celebratory", "encouraging", "inquisitive"]
        response: str

    def __init__(self):
        dotenv.load_dotenv(".env")
        config = {**dotenv.dotenv_values()}
        assert config["GEMINI_API_KEY"]
        self.client = genai.Client(api_key=config["GEMINI_API_KEY"])
        self.model = "gemini-2.5-flash"
        self.config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=self.Response,
        )

    def respond(self, message: Request) -> Response:
        print("RECEIVED REQUEST")
        print(message)
        
        contents: list[types.Content] = []
        
        # feel free to change this (message history stuff)
        
        # all history EXCEPT the last message first
        for m in message.message_history[:-1]:
            role = "user" if m["author"] == "user" else "model"
            content = types.Content(role=role, parts=[types.Part(text=m["content"])])
            contents.append(content)
        
        # build the LAST message with code and instruction
        last_message = message.message_history[-1]
        last_message_parts = [types.Part(text=last_message["content"])]
        
        if message.code:
            last_message_parts.append(types.Part(text=f"\n\nCode:\n```\n{message.code}\n```"))
        if message.instruction:
            last_message_parts.append(types.Part(text=f"\n\nInstruction:\n{message.instruction}"))
        
        role = "user" if last_message["author"] == "user" else "model"
        contents.append(types.Content(role=role, parts=last_message_parts))
        
        response = self.client.models.generate_content(
            model=self.model,
            config=self.config,
            contents=contents,
        )
        print("RECEIVED RESPONSE")
        print(response.parsed)
        return response.parsed # type: ignore


def main():
    ecc = EmpathicChatbotClient()
    client_request = EmpathicChatbotClient.Request(
        message_history=[
            {"author": "user", "content": "What is wrong with this piece of code?"}
        ],
        code='prin_tf("Hello world!\n");',
    )
    print(client_request)
    print("...")
    client_response = ecc.respond(client_request)
    print(client_response)


if __name__ == "__main__":
    main()
