import torch
from transliteration import Encoder, Decoder
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load checkpoint
BASE_DIR = os.path.dirname(__file__)
checkpoint_path = os.path.join(BASE_DIR, "translit_model_checkpoint.pth")
checkpoint = torch.load(checkpoint_path, map_location=device)

# Extract vocab and model size
vocab = checkpoint['vocab']
itos = checkpoint['itos']
vocab_size = len(vocab)

# Recreate models
encoder = Encoder(input_dim=vocab_size, emb_dim=128, hidden_dim=256)
decoder = Decoder(output_dim=vocab_size, emb_dim=128, enc_hid_dim=256, dec_hid_dim=256)

encoder.load_state_dict(checkpoint['encoder_state_dict'])
decoder.load_state_dict(checkpoint['decoder_state_dict'])

encoder.to(device)
decoder.to(device)
encoder.eval()
decoder.eval()

print("✅ Model loaded and ready for inference.")

def predict_multilingual(word_with_lang_token, encoder, decoder, vocab, itos, device, max_len=40):
    encoder.eval()
    decoder.eval()

    with torch.no_grad():
        tokens = word_with_lang_token.strip().split()
        lang_token = tokens[0]
        word = ''.join(tokens[1:])

        if lang_token not in vocab:
            raise ValueError(f"Language token {lang_token} not in vocab.")

        src_seq = [vocab[lang_token]] + [vocab[c] for c in word if c in vocab]
        src_tensor = torch.tensor(src_seq).unsqueeze(0).to(device)

        enc_outputs, h, c = encoder(src_tensor)

        # Merge bi-directional hidden state
        h = h[0:h.size(0):2] + h[1:h.size(0):2]
        c = c[0:c.size(0):2] + c[1:c.size(0):2]

        dec_input = torch.tensor([vocab['<sos>']], device=device)
        output_tokens = []

        for _ in range(max_len):
            out, h, c = decoder(dec_input, h, c, enc_outputs)
            pred_token = out.argmax(1).item()
            if itos.get(pred_token) == '<eos>':
                break
            output_tokens.append(itos.get(pred_token, ''))
            dec_input = torch.tensor([pred_token], device=device)

    return ''.join(output_tokens)

