import base64

import streamlit as st

def render_css():
    with open("image.png", "rb") as image:
        encoded_image = base64.b64encode(image.read()).decode()

    with open("style.css") as css:
        styles = css.read().replace("IMAGE_DATA", encoded_image)

    st.markdown(f"<style>{styles}</style>", unsafe_allow_html=True)

render_css()


st.set_page_config(page_title="DevForge", page_icon=":rocket:", layout="wide")

st.title("DevForge")

st.caption("Welcome to DevForge! This is a platform for developers to collaborate, share ideas, and build amazing projects together.")


