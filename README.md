### Take-Home Assignment: Transliteration Model with Aksharantar Dataset 

# DOCKER BUILD COMMAND 
```bash
# Build the Docker image and run the container
docker build -t translit-fullstack .
docker run -p 3000:3000 translit-fullstack
```


# Model Training code is in the train-model.ipynb file


- Supports: Hindi (`<LANG_HIN>`), Bengali (`<LANG_BEN>`), Tamil (`<LANG_TAM>`)
- Encoder-Decoder architecture with attention mechanism
- End-to-end Dockerized deployment
- FastAPI backend with prediction API
- Frontend built in React/Next.js and served via FastAPI

# File was too big and there were resource limitations to train so trained on a very smaller subset. 
