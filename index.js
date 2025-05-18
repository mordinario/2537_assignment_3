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
console.log(["Template:", Template]);
// Declare amount of cards
const cards = 6;

async function setup () {

    // Get pokemon
    let pkmnRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
    let pkmnsJson = await pkmnRes.json();
    let allPkmn = pkmnsJson.results;
    let cards = [];

    const chosenIndexes = [];
    for(let i = 1; i <= 3; i++)
    {
        let index = Math.floor(Math.random() * 1024);
        chosenIndexes.push(index);
    }

    // For every card
    for(let i = 1; i <= 6; i++)
    {
        // Clone template node
        let card = Template.content.cloneNode(true);
        card.querySelector(".card").id = `img${i}`;
        // Get (unique) index
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

    shuffle(cards)

    for(let i = 0; i < 6; i++)
    {
        document.getElementById("game_grid").appendChild(cards[i]);
    }

    // Matching functionality
    let firstCard = undefined
    let secondCard = undefined
    $(".card").on(("click"), function () {
        $(this).toggleClass("flip");

        // If first card is undefined,
        // set the first card to the clicked card
        if (!firstCard)
        {
            firstCard = $(this).find(".front_face")[0]
            console.log(firstCard)
        }
        // Else,
        // set the second card to the clicked card
        // AND check if the cards match
        else
        {
            secondCard = $(this).find(".front_face")[0]
            console.log(firstCard, secondCard);
            // If the cards' images match
            if (firstCard.src == secondCard.src)
            {
                console.log("match")
                $(`#${firstCard.parentNode.id}`).off("click")
                $(`#${secondCard.parentNode.id}`).off("click")
                firstCard = undefined
                secondCard = undefined
            }
            // Else, if they don't
            else
            {
                console.log("no match")
                console.log()
                setTimeout(() => {
                $(`#${firstCard.parentNode.id}`).toggleClass("flip")
                $(`#${secondCard.parentNode.id}`).toggleClass("flip")
                firstCard = undefined
                secondCard = undefined
                }, 1000)
            }
        }
    });
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

$( document ).ready(function() {
    console.log( "ready!" );
});

setup();