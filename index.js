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
// Declare difficulties
const Difficulties = {
    easy: {
        cardAmount: 6,
        timerSeconds: 15
    },
    medium: {
        cardAmount: 12,
        timerSeconds: 20
    },
    hard: {
        cardAmount: 18,
        timerSeconds: 25
    }
}
// Declare difficulty (for this game)
var difficulty = "easy";
// Declare amount of cards
const cardAmount = Difficulties[difficulty].cardAmount;
var clickAmount = 0;
var pairsLeft = cardAmount / 2;

async function setup() {
    // Set cards up
    await setupCards();

    // Matching functionality
    let firstCard = undefined
    let secondCard = undefined
    // When clicked
    $(".card").on(("click"), function () {
        // If cards are currently being compared,
        // OR if the game has been lost,
        // do nothing
        if($(this).parent().hasClass("paused") ||
           $(this).parent().hasClass("lost"))
        {
            return;
        }
        // Else, flip card
        $(this).toggleClass("flip");
        clickAmount++;
        document.getElementById("clicks").innerText = `Clicks: ${clickAmount}`

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
            document.getElementById("pairs").innerText = `Pairs left: ${pairsLeft}`
            $(`#${firstCard.parentNode.id}`).off("click")
            $(`#${secondCard.parentNode.id}`).off("click")
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

    // Set up timer
    setupTimer();
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
    const chosenIndexes = [];
    for(let i = 1; i <= 3; i++)
    {
        let index = Math.floor(Math.random() * 1024);
        chosenIndexes.push(index);
    }

    // Array of cards
    let cards = [];
    // For every card
    for(let i = 1; i <= 6; i++)
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
        document.getElementById("message_grid").appendChild(winMessage);
        GameGrid.classList.add("won");
    }
}

// Sets up timer
function setupTimer()
{
    // Set timer
    let timerSeconds = Difficulties[difficulty].timerSeconds;
    let secondsLeft = timerSeconds;
    let secondDelay = 1000;
    let timer = setInterval(() => {
        // If game was won, stop counting down
        if(GameGrid.classList.contains("won"))
        {
            timer = clearInterval(timer)
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
            document.getElementById("message_grid").appendChild(loseMessage);
            GameGrid.classList.add("lost");
        }
    }, secondDelay);
}

function setupStats()
{
    document.getElementById("difficulty").innerText = `Difficulty: ${difficulty}`
    document.getElementById("timer").innerText = `Time left: ${Difficulties[difficulty].timerSeconds}`
    document.getElementById("pairs").innerText = `Pairs left: ${cardAmount / 2}`
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

$(document).ready(function() {
    console.log( "ready!" );
});

setup();