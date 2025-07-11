import torch
import torch.nn as nn

class Encoder(nn.Module):
    def __init__(self, input_dim, emb_dim, hidden_dim):
        super(Encoder, self).__init__()
        self.embedding = nn.Embedding(input_dim, emb_dim, padding_idx=0)
        self.lstm = nn.LSTM(emb_dim, hidden_dim, batch_first=True, bidirectional=True)

    def forward(self, src):
        embedded = self.embedding(src)
        outputs, (hidden, cell) = self.lstm(embedded)
        return outputs, hidden, cell

class Attention(nn.Module):
    def __init__(self, enc_hid_dim, dec_hid_dim):
        super(Attention, self).__init__()
        self.attn = nn.Linear(enc_hid_dim * 2 + dec_hid_dim, 1)

    def forward(self, enc_outputs, dec_hidden):
        batch_size, seq_len, _ = enc_outputs.size()
        dec_hidden = dec_hidden.unsqueeze(1).repeat(1, seq_len, 1)
        energy = self.attn(torch.cat((enc_outputs, dec_hidden), dim=2)).squeeze(2)
        attn_weights = torch.softmax(energy, dim=1)
        context = torch.bmm(attn_weights.unsqueeze(1), enc_outputs).squeeze(1)
        return context

class Decoder(nn.Module):
    def __init__(self, output_dim, emb_dim, enc_hid_dim, dec_hid_dim):
        super(Decoder, self).__init__()
        self.embedding = nn.Embedding(output_dim, emb_dim, padding_idx=0)
        self.attention = Attention(enc_hid_dim, dec_hid_dim)
        self.lstm = nn.LSTM(emb_dim + enc_hid_dim * 2, dec_hid_dim, batch_first=True)
        self.fc = nn.Linear(dec_hid_dim, output_dim)

    def forward(self, input_token, hidden, cell, enc_outputs):
        embedded = self.embedding(input_token).unsqueeze(1)
        context = self.attention(enc_outputs, hidden[-1]).unsqueeze(1)
        rnn_input = torch.cat((embedded, context), dim=2)
        output, (hidden, cell) = self.lstm(rnn_input, (hidden, cell))
        prediction = self.fc(output.squeeze(1))
        return prediction, hidden, cell


