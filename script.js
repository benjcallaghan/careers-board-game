class Player {
  /** @type {string} */ #id;
  /** @type {string} */ #name;
  /** @type {HTMLDivElement} */ #token;
  /** @type {HTMLDetailsElement} */ #scorecard;

    #goal = {
        happiness: 0,
        fame: 0,
        fortune: 0,
    };
    #current = {
        happiness: 0,
        fame: 0,
        fortune: 10000,
    };
    #salary = 10000;
    #degree = 'None';
    #experience = {
        ecology: 0,
        business: 0,
        sailing: 0,
        politics: 0,
        entertainment: 0,
        computer: 0,
        mars: 0,
    };

    /**
     * @param {HTMLElement} paydaySquare
     * @param {HTMLTemplateElement} scorecardTemplate
     * @param {HTMLElement} scorecardSection
     * @param {number} playerNumber
     */
    constructor(paydaySquare, scorecardTemplate, scorecardSection, playerNumber) {
        this.#id = `player${playerNumber}`;
        this.#name = `Player ${playerNumber}`;

        this.#token = paydaySquare.appendChild(Player.createToken(this.#id));
        this.#scorecard = scorecardSection.appendChild(
            scorecardTemplate.content.firstElementChild.cloneNode(true)
        );
    }

    /**
     * @param {string} id
     * @returns {HTMLDivElement}
     */
    static createToken(id) {
        const token = document.createElement('div');
        token.setAttribute('id', id);
        token.classList.add('player');
        return token;
    }

    /**
     * @returns {Promise}
     */
    promptForGoals() {
        return new Promise((resolve, reject) => {
            goalsForm.reset();

            goalsDialog.querySelector('h3').innerText = this.#name;
            goalsDialog.showModal();
            goalsDialog.addEventListener('close', e => {
                this.#goal.happiness = happinessInput.valueAsNumber;
                this.#goal.fame = fameInput.valueAsNumber;
                this.#goal.fortune = fortuneInput.valueAsNumber;

                resolve();
            }, { once: true });
        });
    }

    updateScorecard() {
        const summary = this.#scorecard.querySelector('summary');
        summary.innerText = this.#name;

        /** @type {NodeListOf<HTMLDataElement>} */
        const happiness = this.#scorecard.querySelectorAll('data.happiness');
        /** @type {NodeListOf<HTMLDataElement>} */
        const fame = this.#scorecard.querySelectorAll('data.fame');
        /** @type {NodeListOf<HTMLDataElement>} */
        const fortune = this.#scorecard.querySelectorAll('data.fortune');

        happiness[0].value = this.#goal.happiness;
        happiness[0].innerText = `${this.#goal.happiness}♥s`;
        fame[0].value = this.#goal.fame;
        fame[0].innerText = `${this.#goal.fame}★s`;
        fortune[0].value = this.#goal.fortune;
        fortune[0].innerText = `$${this.#goal.fortune.toLocaleString()}`;

        happiness[1].value = this.#current.happiness;
        happiness[1].innerText = `${this.#current.happiness}♥s`;
        fame[1].value = this.#current.fame;
        fame[1].innerText = `${this.#current.fame}★s`;
        fortune[1].value = this.#current.fortune;
        fortune[1].innerText = `$${this.#current.fortune.toLocaleString()}`;

        /** @type {HTMLDataElement} */
        const salary = this.#scorecard.querySelector('data.salary');
        salary.value = this.#salary;
        salary.innerText = `$${this.#salary.toLocaleString()}`;

        /** @type {HTMLDataElement} */
        const degree = this.#scorecard.querySelector('data.degree');
        degree.value = degree.innerText = this.#degree;

        /** @type {NodeListOf<HTMLDataElement>} */
        const experience = this.#scorecard.querySelectorAll('data.experience');
        experience[0].value = experience[0].innerText = this.#experience.ecology;
        experience[1].value = experience[1].innerText = this.#experience.business;
        experience[2].value = experience[2].innerText = this.#experience.sailing;
        experience[3].value = experience[3].innerText = this.#experience.politics;
        experience[4].value = experience[4].innerText =
            this.#experience.entertainment;
        experience[5].value = experience[5].innerText = this.#experience.computer;
        experience[6].value = experience[6].innerText = this.#experience.mars;
    }

    moveOnce() {
        const currentSpace = this.#token.parentElement;
        currentSpace.removeChild(this.#token);

        let nextSpace;
        if (currentSpace.classList.contains('career')) {
            nextSpace = currentSpace.getElementsByTagName('li')[0];
        } else {
            nextSpace = currentSpace.nextElementSibling;
        }

        if (nextSpace.hasAttribute('href')) {
            nextSpace = document.querySelector(nextSpace.getAttribute('href'));
        }

        nextSpace.appendChild(this.#token);
        console.log(`${this.#id} passed space #${nextSpace.id}.${nextSpace.className}.`)
    }

    /** @returns {boolean} */
    metGoal() {
        return (
            this.#current.happiness >= this.#goal.happiness &&
            this.#current.fame >= this.#goal.fame &&
            this.#current.fortune >= this.#goal.fortune
        );
    }
}

/** @type {HTMLDialogElement} */
const goalsDialog = document.getElementById('goals');
const goalsForm = goalsDialog.querySelector('form');
/** @type {HTMLInputElement} */
const happinessInput = goalsForm.elements.namedItem('happinessGoal');
/** @type {HTMLInputElement} */
const fameInput = goalsForm.elements.namedItem('fameGoal');
/** @type {HTMLInputElement} */
const fortuneInput = goalsForm.elements.namedItem('fortuneGoal');
/** @type {HTMLOutputElement} */
const totalOutput = goalsForm.elements.namedItem('totalGoal');

goalsForm.addEventListener('reset', e => {
    totalOutput.nextElementSibling.textContent = '';
})
goalsForm.addEventListener('input', e => {
    totalOutput.value = happinessInput.valueAsNumber + fameInput.valueAsNumber + Math.floor(fortuneInput.valueAsNumber / 10000);
    if (totalOutput.value === '60') {
        totalOutput.setCustomValidity('');
    } else {
        totalOutput.setCustomValidity('The total points must add up to 60.');
        totalOutput.reportValidity();
    }
});
goalsForm.addEventListener('submit', e => {
    if (!totalOutput.validity.valid) {
        e.preventDefault();
        totalOutput.nextElementSibling.textContent = 'The total points must add up to 60.';
    }
});

/** @type {HTMLDialogElement} */
const setupDialog = document.getElementById('setup');
setupDialog.showModal();
setupDialog.addEventListener('close', async e => {
    /** @type {HTMLInputElement} */
    const playerCountInput = document.getElementsByName('playerCount')[0];

    /** @type {HTMLTemplateElement} */
    const scorecardTemplate = document.getElementById('scorecard');
    const paydaySquare = document.getElementById('payday');
    const asideSection = document.getElementsByTagName('aside')[0];

    /** @type {Player[]} */
    const players = [];
    for (let i = 1; i <= playerCountInput.valueAsNumber; i++) {
        const player = new Player(paydaySquare, scorecardTemplate, asideSection, i);
        await player.promptForGoals();
        player.updateScorecard();
        players.push(player);
    }

    // setInterval(() => {
    //   players[0].moveOnce();
    // }, 1000);
}, { once: true });



