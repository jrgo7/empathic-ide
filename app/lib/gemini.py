from google import genai
from google.genai import types
import dotenv
from dataclasses import dataclass, field
from typing import Literal


class EmpathicChatbotClient:

    @dataclass(frozen=True)
    class Request:
        message_history: list[dict[Literal["author", "content"], str]]
        code: str = ""
        instruction: str | None = None

    @dataclass(frozen=True)
    class Response:
        sentiment: Literal["celebratory", "encouraging", "inquisitive"]
        acknowledgement: str
        supportive_suggestion: str
        error_explanation: str | None

    def __init__(self):
        dotenv.load_dotenv(".env")
        config = {**dotenv.dotenv_values()}
        assert config["GEMINI_API_KEY"]
        self.client = genai.Client(api_key=config["GEMINI_API_KEY"])
        self.model = "gemini-2.5-flash"
        self.config = types.GenerateContentConfig(
            system_instruction=(
                "You are Ceci, an empathic tutor for CCPROG1, an introductory programming class "
                "taught to first-year university students at De La Salle University. "
                "Your response must always be in a JSON format that adheres to the following schema:\n"
                "{\n"
                '  "sentiment": "celebratory" | "encouraging" | "inquisitive",\n'
                '  "acknowledgement": "A statement that validates the user\'s feelings or situation.",\n'
                '  "supportive_suggestion": "A clear, actionable next step or question to guide the student.",\n'
                '  "error_explanation": "A simple, beginner-friendly explanation of a technical error, or null if there is no error."\n'
                "}\n"
                "Use 'celebratory' sentiment for successful code execution. "
                "Use 'encouraging' for errors or when the user is struggling. "
                "Use 'inquisitive' when asking a clarifying question.\n"
            ),
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
