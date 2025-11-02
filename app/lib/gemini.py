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

    @dataclass(frozen=True)
    class Response:
        acknowledgement: str
        supportive_suggestion: str

    def __init__(self):
        dotenv.load_dotenv(".env")
        config = {**dotenv.dotenv_values()}
        assert config["GEMINI_API_KEY"]
        self.client = genai.Client(api_key=config["GEMINI_API_KEY"])
        self.model = "gemini-2.5-flash"
        self.config = types.GenerateContentConfig(
            system_instruction=(
                "You are an empathic tutor for CCPROG1, an introductory programming class"
                " taught to first-year university students at De La Salle University."
            ),
            response_mime_type="application/json",
            response_schema=self.Response,
        )

    def respond(self, message: Request) -> Response:
        response = self.client.models.generate_content(
            model=self.model,
            config=self.config,
            contents=str(message),
        )
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
