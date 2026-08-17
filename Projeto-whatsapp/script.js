import { usuarios, listarUsuarios, listarContatosUsuario, listarMensagensUsuario } from "./contatos.js";
listarMensagensUsuario(0, 0);

const fotoPerfilNav = document.querySelector('#foto-perfil');
const btnMensagens = document.querySelector('#btn-mensagens');
const secoesPerfil = document.querySelectorAll('.sessão-contato');
const botoesPerfil = document.querySelectorAll('.perfil');

// volta pro layout principal (lado-esquerdo + main)
btnMensagens.addEventListener('click', () => {
    document.body.classList.remove('modo-perfil');
    secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
});

// abre/fecha a aba de perfil ao clicar na foto do nav
fotoPerfilNav.addEventListener('click', () => {
    document.body.classList.toggle('modo-perfil');

    if (document.body.classList.contains('modo-perfil')) {
        const algumaAtiva = document.querySelector('.sessão-contato.ativo');
        if (!algumaAtiva) {
            secoesPerfil[0].classList.add('ativo'); // abre no Ricky por padrão
        }
    } else {
        secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
    }
});

// troca de perfil ao clicar em cada foto da lista "Trocar de Perfil"
botoesPerfil.forEach((perfil) => {
    perfil.addEventListener('click', () => {
        const nome = perfil.querySelector('h3').textContent.trim().toLowerCase();
        const alvo = document.querySelector(`#${nome}`);

        secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
        alvo.classList.add('ativo');
    });
});

// envio de mensagem
const formEnviar = document.querySelector('.aba-enviar');
const inputMsg = document.querySelector('#send-msg');
const botaoEnviar = document.querySelector('.botao-enviar');
const gridMsg = document.querySelector('.grid-msg');

formEnviar.addEventListener('submit', (e) => {
    e.preventDefault(); // evita recarregar a página (cobre o Enter também)

    const texto = inputMsg.value.trim();
    if (!texto) return;

    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    const artigo = document.createElement('article');
    artigo.classList.add('enviadas');

    const p = document.createElement('p');
    p.textContent = texto;

    const span = document.createElement('span');
    span.textContent = hora;

    artigo.append(p, span);
    gridMsg.appendChild(artigo);

    inputMsg.value = '';
    gridMsg.scrollTop = gridMsg.scrollHeight;
});

// clicar na imagem dispara o mesmo envio do form
botaoEnviar.addEventListener('click', () => {
    formEnviar.requestSubmit();
});