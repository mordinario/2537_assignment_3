/*
 ̶  As a game developer, I want to retrieve Pokémon randomly from the Pokiapi.co API server,
   so that each game session offers a unique experience set of Pokémon cards.
 - As a player, I want to play a card game utilizing Pokémon cards, so that I can enjoy the
   game with familiar and exciting Pokémon.
 - As a player, I want to have different difficulty levels (easy, medium, and hard), so that
   I can choose the level of challenge that suits my skill and preference.
 - As a player, I want the number of cards and time limits to adjust based on the chosen
   difficulty level, so that the game remains balanced and appropriately challenging.
 - As a player, I want to ensure that each Pokémon can only be assigned to a single card pairing,
   so that the game follows the rules of memory card games and offers a fair gameplay experience.
 - As a player, I want the game to have a start button, so that I can initiate a new
   game session whenever I'm ready.
 - As a player, I want the game to have a reset button, so that I can restart the current
   game session if I make a mistake or want to start over.
 - As a player, I want to see a header displaying relevant game information, such as the
   number of clicks I have made, the number of pairs left, the number of pairs matched, and the
   total number of pairs, so that I can track my progress and stay informed during the game.
 - As a player, I want to be able to select different themes (e.g., dark and light), so that
   I can customize the visual appearance of the game according to my preference.
 - As a player, I want a power-up feature that helps me during the game, such as allowing me to
   see all the cards for a short period of time, so that I can strategically plan my moves and
   improve my chances of finding matching pairs.
*/

// Declare card template
const Template = document.getElementById("card-template");
const GameGrid = document.getElementById("game_grid");
const MessageGrid = document.getElementById("message_grid");
const resetButton = document.getElementById("reset");
const startButton = document.getElementById("start");
const PairsLeft = document.getElementById("pairs_left");
const PairsMatched = document.getElementById("pairs_matched");
const PairsTotal = document.getElementById("pairs_total");
// Declare difficulties
const Difficulties = {
    Easy: {
        cardAmount: 6,
        timerSeconds: 20
    },
    Medium: {
        cardAmount: 12,
        timerSeconds: 35
    },
    Hard: {
        cardAmount: 18,
        timerSeconds: 45
    }
}
// Declare variables

var difficulty = "Easy";
var gameReset;
var clickAmount;
var cardAmount;
var pairsLeft;

// Initializes game to specified
// difficulty (or current difficulty
// if unspecified)
function setupDifficulty(difficultyToBe)
{
    if(typeof difficultyToBe != 'undefined')
    {
        difficulty = difficultyToBe
    }
    GameGrid.classList.add(difficulty)
    gameReset = true;
    // Declare amount of cards
    cardAmount = Difficulties[difficulty].cardAmount;
    clickAmount = 0;
    pairsLeft = cardAmount / 2;
}

setupDifficulty();

async function setup() {
    // Set cards up
    await setupCards();

    // Matching functionality
    let firstCard = undefined
    let secondCard = undefined
    // When clicked
    $(".card").on(("click"), function () {
        // If game running, count click
        if($(this).parent().hasClass("running"))
        {
            clickAmount++;
            document.getElementById("clicks").innerText = `Clicks: ${clickAmount}`
        }
        // If cards are currently being compared,
        // do nothing
        if($(this).parent().hasClass("paused"))
        {
            return;
        }
        // Else, flip card
        $(this).toggleClass("flip");

        // If first card is undefined,
        // set the first card to the clicked card
        if (!firstCard)
        {
            firstCard = $(this).find(".front_face")[0]
            console.log(firstCard)
            return;
        }
        // Else,
        // set the second card to the clicked card
        // AND check if the cards match
        secondCard = $(this).find(".front_face")[0]
        console.log(firstCard, secondCard);
        // If the cards' ids match (i.e. same card),
        // do nothing
        if(firstCard.parentNode.id == secondCard.parentNode.id)
        {
            firstCard = undefined
            return;
        }
        // If the cards' images match
        if (firstCard.src == secondCard.src)
        {
            // Disable the cards' clicking
            console.log("match")
            pairsLeft--;
            refreshStats();
            $(`#${firstCard.parentNode.id}`).off("click")
            $(`#${secondCard.parentNode.id}`).off("click")
            firstCard.parentNode.classList.add("solved")
            secondCard.parentNode.classList.add("solved")
            // Reset selected cards
            firstCard = undefined
            secondCard = undefined
            // Check if game won
            checkIfGameWon();
            return
        }
        // Else, if they don't
        console.log("no match")
        // Create temp variables to
        // hold card objects
        let tempFirstCard = firstCard
        let tempSecondCard = secondCard
        // Reset selected cards
        firstCard = undefined
        secondCard = undefined
        // Add "paused" class to
        // game grid to pause card selection
        GameGrid.classList.add("paused")
        // In one second, flip cards over and
        // remove "paused" class
        setTimeout(() => {
            $(`#${tempFirstCard.parentNode.id}`).toggleClass("flip")
            $(`#${tempSecondCard.parentNode.id}`).toggleClass("flip")
            GameGrid.classList.remove("paused")
        }, 1000)
    });
    // Set up stats
    setupStats();
}

// Sets up pokemon cards
async function setupCards()
{
    // Get pokemon
    let pkmnRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
    let pkmnsJson = await pkmnRes.json();
    let allPkmn = pkmnsJson.results;

    // Set chosen pokemon indexes
    let chosenIndexes = [];
    for(let i = 0; i < pairsLeft; i++)
    {
        let randIndex = Math.floor(Math.random() * 1024);
        chosenIndexes.push(randIndex);
    }
    console.log(chosenIndexes)

    // Array of cards
    let cards = [];
    // For every card
    for(let i = 1; i <= cardAmount; i++)
    {
        // Clone template node
        let card = Template.content.cloneNode(true);
        card.querySelector(".card").id = `img${i}`;
        // Get index
        // (math function guarantees each
        //  unique pokemon gets two cards each)
        let index = chosenIndexes[Math.floor((i - 1) / 2)]
        // Get results for pokemon at that index
        let name = allPkmn[index].name;
        let chosenPkmn = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        let pkmnJson = await chosenPkmn.json();
        // Set img of card accordingly
        let img = pkmnJson.sprites.other['official-artwork'].front_default;
        card.querySelector(".front_face").src = img;
        // Push card
        cards.push(card)
    }
    // Shuffle cards
    shuffle(cards)
    // Append cards to game grid
    for(let i = 0; i < cardAmount; i++)
    {
        GameGrid.appendChild(cards[i]);
    }
}

// Checks if the all cards are
// flipped over (and, therefore,
// if the game has been won)
function checkIfGameWon()
{
    // If any cards aren't flipped over,
    // then the game is not done yet
    let solved = true;
    for(let i = 1; i <= cardAmount; i++)
    {
        let newCard = GameGrid.querySelector(`#img${i}`)
        if(!newCard.classList.contains("flip"))
        {
            solved = false;
            break;
        }
    }
    // If all cards are flipped over,
    // then the game is won
    if(solved == true)
    {
        GameGrid.classList.add("solved")
        let winMessage = document.createElement("p");
        winMessage.classList.add("message");
        winMessage.innerText = "You win!";
        MessageGrid.appendChild(winMessage);
        GameGrid.classList.add("won");
    }
}

// Sets up timer
function startTimer()
{
    GameGrid.classList.remove("paused");
    // Set timer
    let timerSeconds = Difficulties[difficulty].timerSeconds;
    let secondsLeft = timerSeconds;
    let secondDelay = 1000;
    let timer = setInterval(() => {
        // If game was won, stop counting down
        if(GameGrid.classList.contains("won") ||
           gameReset == true)
        {
            timer = clearInterval(timer)
            GameGrid.classList.remove("won")
            return
        }
        secondsLeft--;
        document.getElementById("timer").innerText = "Time left: " + secondsLeft
        // If timer runs out
        if(secondsLeft == 0)
        {
            timer = clearInterval(timer)
            let loseMessage = document.createElement("p");
            loseMessage.classList.add("message");
            loseMessage.innerText = "You lose!";
            MessageGrid.appendChild(loseMessage);
            GameGrid.classList.add("paused");
        }
    }, secondDelay);
}

// Sets up stats
function setupStats()
{
    document.getElementById("difficulty").innerText = `Difficulty: ${difficulty}`
    document.getElementById("timer").innerText = `Time left: ${Difficulties[difficulty].timerSeconds}`
    PairsLeft.innerText = `Pairs left: ${cardAmount / 2}`
    PairsMatched.innerText = `Pairs matched: 0`
    PairsTotal.innerText = `Total pairs: ${cardAmount / 2}`
    document.getElementById("clicks").innerText = `Clicks: 0`
}

// Shuffles an array
// Taken from StackOverflow
// (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

// Resets the game to a specific difficulty
// (or current difficulty if unspecified)
function reset(difficulty)
{
    gameReset = true;
    GameGrid.innerHTML = '';
    GameGrid.className = "";
    GameGrid.classList.add("paused");
    GameGrid.classList.remove("running");
    startButton.classList.remove("disabled")
    MessageGrid.innerHTML = '';
    setupDifficulty(difficulty)
    setup()
}

// Starts the game
function start()
{
    // Start, ONLY if game isn't running
    if(!GameGrid.classList.contains("running"))
    {
        gameReset = false;
        GameGrid.classList.add("running")
        startButton.classList.add("disabled")
        // Set up timer
        startTimer();
    }
}

// Sets the theme of the page
function setTheme(theme)
{
    document.body.className = ''
    document.body.classList.add(theme)
}

// Refreshes the stats
function refreshStats() {
    PairsLeft.innerText = `Pairs left: ${pairsLeft}`
    PairsMatched.innerText = `Pairs matched: ${cardAmount / 2 - pairsLeft}`
    PairsTotal.innerText = `Total pairs: ${cardAmount / 2}`
}
$(document).ready(function() {
    console.log( "ready!" );
});

setup();