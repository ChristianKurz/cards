const path = require('path');
const fs = require('fs-extra');
const { compress } = require('compress-json');
const { capitalize } = require('lodash');
const yaml = require('js-yaml');
const readdir = require('recursive-readdir');

fs.ensureDirSync('./dist');

const formatCard = (card) => {
  if (
    !fs.existsSync(
      `./content/card-images/${card.product}/${card.locale}/${card.image}.png`,
    )
  ) {
    card.locale = 'en-US';
  }

  const baseImageName = card.image;
  card.image = `https://ledercards.netlify.app/cards/${card.product}/${card.locale}/${baseImageName}.webp`;

  return card;
};

const readAllCards = async () => {
  const allCardFiles = await readdir('./content/card-data');
  const allCards = allCardFiles
    .map((f) => {
      const cards = yaml.load(fs.readFileSync(f));

      const [, , product, locale] = f.split(path.sep);
      cards.forEach((c) => {
        c.product = product;
        c.locale = locale;
      });

      return cards;
    })
    .flat()
    .map((c) => formatCard(c));

  const formattedCards = allCards;

  fs.writeJsonSync('dist/cards.json', formattedCards);
  fs.writeJsonSync('dist/cards.min.json', compress(formattedCards));

  console.log(`Got ${formattedCards.length} cards!`);
};

readAllCards();
