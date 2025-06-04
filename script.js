document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Efeito Parallax
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('[data-parallax]').forEach(elem => {
            const speed = parseFloat(elem.getAttribute('data-parallax'));
            const x = (window.innerWidth - e.pageX * speed) / 100;
            const y = (window.innerHeight - e.pageY * speed) / 100;
            elem.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });

    // Alternar menu móvel
    const menuToggle = document.getElementById('menuToggle');
    const navActions = document.querySelector('.nav-actions');

    if (menuToggle && navActions) {
        menuToggle.addEventListener('click', () => {
            navActions.classList.toggle('active');
        });

        document.querySelectorAll('.nav-actions .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navActions.classList.remove('active');
            });
        });
    }

    // Partículas dinâmicas
    const bgContainer = document.querySelector('.bg-container');
    if (bgContainer) {
        for (let i = 0; i < 3; i++) {
            const layer = document.createElement('div');
            layer.classList.add('particle-layer');
            bgContainer.appendChild(layer);

            const numParticles = 20;
            for (let j = 0; j < numParticles; j++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
                particle.style.animationDelay = `${Math.random() * -10}s`;
                layer.appendChild(particle);
            }
        }
    }

    // Funcionalidade do Formulário de Agendamento
    const bookingForm = document.getElementById('bookingForm');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const serviceSelect = document.getElementById('service');
    const initialMessage = document.querySelector('.initial-message');

    const bookedAppointments = []; // Fila FIFO (First-In, First-Out) para agendamentos.
    // O conceito FIFO significa que o primeiro agendamento a entrar na fila será o primeiro a sair.
    // Isso é útil para gerenciar a capacidade de agendamentos.

    // Exemplo de implementação FIFO (opcional, normalmente feito no backend):
    // Se houver uma capacidade máxima de agendamentos (ex: MAX_CAPACITY = 10),
    // e um novo agendamento for adicionado quando a fila já estiver cheia,
    // o agendamento mais antigo será removido para abrir espaço para o novo.

    // if (bookedAppointments.length > MAX_CAPACITY) {
    //     bookedAppointments.shift(); // Remove o agendamento mais antigo da fila (o primeiro a entrar).
    // }

    // Serviços de exemplo com durações
    const services = [
        { name: 'Corte Masculino', duration: 35 },
        { name: 'Barba Completa', duration: 25 },
        { name: 'Corte + Barba', duration: 50 },
        { name: 'Tratamento Capilar', duration: 45 },
        { name: 'Corte Infantil', duration: 30 },
        { name: 'Desenho na Barba', duration: 20 }
    ];

    // Definir a data mínima para appointmentDate como hoje
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    appointmentDateInput.min = `${yyyy}-${mm}-${dd}`;

    // Definir automaticamente a data de hoje
    appointmentDateInput.value = `${yyyy}-${mm}-${dd}`;

    // Selecionar automaticamente o primeiro serviço
    if (serviceSelect.options.length > 1) {
        serviceSelect.value = serviceSelect.options[1].value;
    }

    let selectedTimeSlot = null;
    let currentFilter = 'all';

    // Obter botões de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Adicionar listeners de evento aos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover a classe 'active' de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar a classe 'active' ao botão clicado
            button.classList.add('active');

            currentFilter = button.dataset.filter;
            generateTimeSlots();
        });
    });

    // Função para gerar horários para uma dada data e duração do serviço
    function generateTimeSlots() {
        const selectedDate = appointmentDateInput.value;
        const selectedService = serviceSelect.value;
        const service = services.find(s => s.name === selectedService);

        if (!selectedDate || !service) {
            timeSlotsContainer.innerHTML = '';
            if (initialMessage) {
                initialMessage.style.display = 'block';
            }
            return;
        }

        timeSlotsContainer.innerHTML = '';
        if (initialMessage) {
            initialMessage.style.display = 'none';
        }
        selectedTimeSlot = null;

        const startTime = 9 * 60;
        const endTime = 18 * 60;
        const interval = 30;

        const appointmentsForDate = bookedAppointments.filter(app => app.date === selectedDate);

        // Criar contêineres para categorias de tempo
        const morningSlots = document.createElement('div');
        morningSlots.classList.add('time-category');
        morningSlots.innerHTML = '<h4>☀️ Manhã</h4><div class="time-slots-grid"></div>';
        timeSlotsContainer.appendChild(morningSlots);

        const afternoonSlots = document.createElement('div');
        afternoonSlots.classList.add('time-category');
        afternoonSlots.innerHTML = '<h4>🌙 Tarde</h4><div class="time-slots-grid"></div>';
        timeSlotsContainer.appendChild(afternoonSlots);

        const morningGrid = morningSlots.querySelector('.time-slots-grid');
        const afternoonGrid = afternoonSlots.querySelector('.time-slots-grid');

        for (let i = startTime; i < endTime; i += interval) {
            const hour = Math.floor(i / 60);
            const minute = i % 60;
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

            // Pular todos os horários 12:XX
            if (hour === 12) {
                continue; 
            }

            const slotStart = i;
            const slotEnd = i + service.duration;

            // Verificar sobreposições com agendamentos existentes
            const isBooked = appointmentsForDate.some(app => {
                const appStart = timeToMinutes(app.time);
                const appEnd = appStart + app.duration;
                return (slotStart < appEnd && slotEnd > appStart);
            });

            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('time-slot-card');
            timeSlotDiv.textContent = timeString;
            timeSlotDiv.dataset.time = timeString;

            if (isBooked) {
                timeSlotDiv.classList.add('booked');
            } else {
                timeSlotDiv.addEventListener('click', () => {
                    // Remover 'selected' do slot selecionado anteriormente
                    if (selectedTimeSlot) {
                        selectedTimeSlot.classList.remove('selected');
                    }
                    // Adicionar 'selected' ao slot atual
                    timeSlotDiv.classList.add('selected');
                    selectedTimeSlot = timeSlotDiv;
                });
            }

            // Anexar à categoria correta
            if (hour >= 9 && hour < 12) {
                if (currentFilter === 'all' || currentFilter === 'morning') {
                    morningGrid.appendChild(timeSlotDiv);
                }
            } else if (hour >= 12) {
                if (currentFilter === 'all' || currentFilter === 'afternoon') {
                    afternoonGrid.appendChild(timeSlotDiv);
                }
            }
        }

        // Aplicar classe de categoria ativa com base no filtro e conteúdo
        morningSlots.classList.remove('active-category');
        afternoonSlots.classList.remove('active-category');

        if (currentFilter === 'all') {
            if (morningGrid.children.length > 0) {
                morningSlots.classList.add('active-category');
            }
            if (afternoonGrid.children.length > 0) {
                afternoonSlots.classList.add('active-category');
            }
        } else if (currentFilter === 'morning') {
            if (morningGrid.children.length > 0) {
                morningSlots.classList.add('active-category');
            }
        } else if (currentFilter === 'afternoon') {
            if (afternoonGrid.children.length > 0) {
                afternoonSlots.classList.add('active-category');
            }
        }
    }

    // Função auxiliar para converter "HH:MM" em minutos desde a meia-noite
    function timeToMinutes(time) {
        const [hour, minute] = time.split(':').map(Number);
        return hour * 60 + minute;
    }

    appointmentDateInput.addEventListener('change', generateTimeSlots);
    serviceSelect.addEventListener('change', generateTimeSlots);

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const clientName = document.getElementById('clientName').value;
        const selectedDate = appointmentDateInput.value;
        const selectedService = serviceSelect.value;
        const service = services.find(s => s.name === selectedService);

        if (!selectedTimeSlot) {
            alert('Por favor, selecione um horário disponível.');
            return;
        }

        const appointmentTime = selectedTimeSlot.dataset.time;

        const newAppointment = {
            name: clientName,
            date: selectedDate,
            time: appointmentTime,
            service: selectedService,
            duration: service.duration
        };

        bookedAppointments.push(newAppointment);

        // Enviar detalhes do agendamento via WhatsApp
        sendWhatsAppMessage(newAppointment);

        bookingForm.reset();
        timeSlotsContainer.innerHTML = '';
        selectedTimeSlot = null;
        generateTimeSlots();
    });

    function sendWhatsAppMessage(appointment) {
        const adminPhoneNumber = '5575988008504';
        const message = encodeURIComponent(
            `*🔔 Novo Agendamento! 🔔*\n\n` +
            `*👤 Nome:* ${appointment.name}\n` +
            `*🗓️ Data:* ${appointment.date}\n` +
            `*⏰ Hora:* ${appointment.time}\n` +
            `*✂️ Serviço:* ${appointment.service}\n\n` +
            `Aguardando confirmação. ✅`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${adminPhoneNumber}&text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
});

$(window).on("load", function () {
  $("#loadingScreen").addClass("hidden");
}); 
