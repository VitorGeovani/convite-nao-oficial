const answerOptions = document.querySelectorAll('.answer-option');
const placeOptions = document.querySelectorAll('.place-option');
const planningFields = document.querySelector('#planning-fields');
const dateInput = document.querySelector('#date');
const timeInput = document.querySelector('#time');
const messageInput = document.querySelector('#message');
const modal = document.querySelector('#success-modal');
const summary = document.querySelector('#summary');
const copyStatus = document.querySelector('#copy-status');
const memeText = document.querySelector('#meme-text');
const confirmButton = document.querySelector('#confirm-button');
const copyButton = document.querySelector('#copy-button');

const OWNER_EMAIL = 'vitorbox77@gmail.com';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${OWNER_EMAIL}`;

let selectedPlace = 'Café aconchegante';

const memes = [
  'meu cérebro depois de você aceitar: <strong>stonks</strong>',
  'eu escolhendo a roupa: <strong>confiança desbloqueada</strong>',
  'a agenda vendo nosso encontro: <strong>evento principal</strong>',
  'eu tentando agir normalmente: <strong>falha crítica</strong>'
];
let memeIndex = 0;

function selectPlace(button) {
  placeOptions.forEach((option) => {
    const isSelected = option === button;
    option.classList.toggle('selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  });
  selectedPlace = button.dataset.place;
}

placeOptions.forEach((button) => button.addEventListener('click', () => selectPlace(button)));

document.querySelector('#meme-button').addEventListener('click', () => {
  memeIndex = (memeIndex + 1) % memes.length;
  memeText.innerHTML = memes[memeIndex];
});

function formatDate(value) {
  if (!value) return 'a combinar';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${value}T12:00:00`));
}

function getInviteData() {
  const time = timeInput.value || 'a combinar';
  const note = messageInput.value.trim();
  const answerLine = 'Sim, bora! O universo já está providenciando a trilha sonora.';
  const formattedDate = formatDate(dateInput.value);
  const details = `<strong>Lugar:</strong> ${selectedPlace}<br><strong>Data:</strong> ${formattedDate}<br><strong>Hora:</strong> ${time}${note ? `<br><strong>Obs.:</strong> ${note}` : ''}`;

  return {
    answer: answerLine,
    place: selectedPlace,
    date: formattedDate,
    time,
    note: note || 'Nenhuma observação',
    summary: `<strong>${answerLine}</strong><br><br>${details}`
  };
}

async function sendInvite(data) {
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: 'Novo retorno do convite de encontro',
      resposta: data.answer,
      lugar: data.place,
      data: data.date,
      horario: data.time,
      observacao: data.note,
      _template: 'table'
    })
  });

  if (!response.ok) throw new Error('Falha no envio');
}

async function openModal() {
  const data = getInviteData();
  confirmButton.disabled = true;
  confirmButton.innerHTML = 'Enviando... <span>↗</span>';
  copyStatus.textContent = 'Enviando os detalhes para o dono do convite...';

  try {
    await sendInvite(data);
    summary.innerHTML = data.summary;
    copyStatus.textContent = 'Enviado com sucesso. Agora é só comemorar discretamente.';
  } catch {
    summary.innerHTML = data.summary;
    copyStatus.textContent = 'Não consegui enviar agora. O botão de copiar continua disponível como plano B.';
  } finally {
    confirmButton.disabled = false;
    confirmButton.innerHTML = 'Fechar esse encontro <span>→</span>';
  }

  modal.hidden = false;
  document.querySelector('#close-modal').focus();
}

confirmButton.addEventListener('click', openModal);
document.querySelector('#close-modal').addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') modal.hidden = true; });

copyButton.addEventListener('click', async () => {
  const text = summary.innerText;
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Combinado copiado. Agora é só mandar com charme.';
  } catch {
    copyStatus.textContent = 'Selecione o resumo acima para copiar manualmente.';
  }
});

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
dateInput.min = tomorrow.toISOString().split('T')[0];
