import { app } from './firebaseConfig.js';
import { getDatabase, ref, push } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

const db = getDatabase(app);
const form = document.getElementById('contactForm');
const submitedvc = document.getElementById('submitedvc');
const submitedxc = document.getElementById('submitedxc');
const loadingc = document.querySelector('.loadingc');

function attachFormValidator(elements) {
    regula.custom({
        name: 'CustomAlphaNumeric',
        validator: function () {
            if (this.value === '') return true;
            else return /^[0-9\-() ]+$/i.test(this.value);
        }
    });

    regula.custom({
        name: 'NameValidate',
        validator: function () {
            if (this.value === '') return true;
            else return /^[a-zA-ZÀ-ÿ\u00f1\u00d1]{2,}$/i.test(this.value);
        }
    });

    for (var i = 0; i < elements.length; i++) {
        var o = $(elements[i]), v;
        o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
        v = o.parent().find(".form-validation");
        if (v.is(":last-child")) o.addClass("form-control-last-child");
    }

    elements.on('input change propertychange blur', function (e) {
        var $this = $(this), results;

        if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
        if ($this.parents('.rd-mailform').hasClass('success')) return;

        if ((results = $this.regula('validate')).length) {
            for (i = 0; i < results.length; i++) {
                $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
            }
        } else {
            $this.siblings(".form-validation").text("").parent().removeClass("has-error")
        }
    }).regula('bind');

    for (var i = 0; i < regularConstraintsMessages.length; i++) {
        var regularConstraint = regularConstraintsMessages[i];

        regula.override({
            constraintType: regularConstraint.type,
            defaultMessage: regularConstraint.newMessage
        });
    }
}

function isValidated(elements) {
    var errors = 0;

    if (elements.length) {
        elements.each(function () {
            var $input = $(this);
            var results = $input.regula('validate');
            var $validation = $input.siblings(".form-validation");

            if (results.length) {
                errors++;
                $validation.text(results[0].message).parent().addClass("has-error");
            } else {
                $validation.text("").parent().removeClass("has-error");
            }
        });
    }

    return errors === 0;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isValidated($(form).find('input, textarea'))) {
        const primeiroNome = document.getElementById('contact-first-name').value;
        const ultimoNome = document.getElementById('contact-last-name').value;
        const email = document.getElementById('contact-email').value;
        const telefone = document.getElementById('contact-phone').value;
        const mensagem = document.getElementById('contact-message').value;

        const now = new Date();
        const formattedTimestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const newForm = {
            primeiroNome,
            ultimoNome,
            email,
            telefone,
            mensagem,
            data: formattedTimestamp
        };

        loadingc.classList.add("visible");

        try {
            const formRef = ref(db, 'Contatos');
            await push(formRef, newForm);
            setTimeout(function() {
                loadingc.classList.remove("visible");
                submitedvc.classList.add("visible");
                setTimeout(function() {
                    submitedvc.classList.remove("visible");
                }, 3000);
            }, 3000);
            form.reset();
        } catch (error) {
            setTimeout(function() {
                loadingc.classList.remove("visible");
                submitedxc.classList.add("visible");
                setTimeout(function() {
                    submitedxc.classList.remove("visible");
                }, 3000);
            }, 3000);
        }        
    }
});
