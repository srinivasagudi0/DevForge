from openai import OpenAI

def generate_blueprint(template):
    client = OpenAI()

    prompt = f"Generate a project blueprint for a {template} application. Include the directory structure and necessary files."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates project blueprints."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.contents