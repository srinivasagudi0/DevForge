import base64 as b

import streamlit as st

def render_css():
    with open("image.png", "rb") as image:
        encoded_image = b.b64encode(image.read()).decode()

    with open("style.css") as css:
        styles = css.read().replace("IMAGE_DATA", encoded_image)

    st.markdown(f"<style>{styles}</style>", unsafe_allow_html=True)

render_css()


st.set_page_config(page_title="DevForge", page_icon=":rocket:", layout="wide")


st.sidebar.header("Navigation")
nav = st.sidebar.selectbox("Go to", ["Home", "Project Blueprint"])



if nav == "Home":
    st.title("DevForge")
    st.caption("Welcome to DevForge! This is a platform for developers that build projects and want to automate annoying tasks.")
    st.header("Features")
    st.markdown("""
    - Project Blueprint: Choose a template and customize it to kickstart your project.
                """)

if nav == "Project Blueprint":
    st.title("Project Blueprint")
    st.caption("Select a template and customize it to create your project structure.")
    template = st.selectbox("Choose a template", ["Flask", "React", "Django", "Node.js", "Vue.js", "Angular", "FastAPI", "Next.js", "Svelte", "Express.js", "Laravel", "Spring Boot", "Ruby on Rails", "ASP.NET Core"])
    if st.button('Generate Project Structure'):
        st.success(f"Project structure for {template} generated successfully!")