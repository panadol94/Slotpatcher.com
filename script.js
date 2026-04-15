/* ============================================
   SQUEEN668 RTP SCANNER — JavaScript
   Game data sourced from 99laju.net
   ============================================ */

// ==========================================
// CDN Base URLs (confirmed from 99laju.net)
// ==========================================
const CDN_GAME = 'https://images.cashmarket888.xyz/uploads%2Fslot_game%2Fimage_path%2F'; // cm8-agent verified CDN
const CDN_PROVIDER = 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-provider/2x1/SL/'; // 99laju provider logos

// ==========================================
// TIME-SEEDED PRNG (deterministic RTP within time window)
// ==========================================
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function getTimeSeed(provider, intervalMinutes) {
    const slot = Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
    let hash = 0;
    const str = provider + '-' + slot + '-30-97-85-65-10-30';
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
}

const SCANNER_CONFIG = {
    minRtp: 30, maxRtp: 97,
    hotThreshold: 85, warmThreshold: 65,
    hotPercent: 10, warmPercent: 30,
    seedInterval: 60
};

// ==========================================
// GAME DATABASE — 99laju.net
// Images: Verified cashmarket888.xyz CDN URLs from cm8-agent
// Provider logos: 99laju.net CDN
// ==========================================
const GAME_DATABASE = {
    pragmatic: {
        name: 'PRAGMATIC',
        code: 'PRAGMATIC',
        logo: CDN_PROVIDER + 'PRAGMATIC.png',
        games: [
            { name: 'Joker Race \\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Joker%20Race%20\u2122.webp' },
            { name: 'Touro Sortudo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Touro%20Sortudo.webp' },
            { name: 'Mahjong Wins - Gong Xi Fa Cai', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Mahjong%20Wins%20-%20Gong%20Xi%20Fa%20Cai.webp' },
            { name: 'Spaceman', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Spaceman.webp' },
            { name: '888 Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/888%20Gold.webp' },
            { name: 'Archer Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Archer%20Gold.webp' },
            { name: 'Starz Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Starz%20Megaways.webp' },
            { name: 'Mahjong Wins 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Mahjong%20Wins%202.webp' },
            { name: '188bet Sweet Bonanza\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/188bet%20Sweet%20Bonanza\u2122.webp' },
            { name: 'Fruit Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fruit%20Party.webp' },
            { name: 'Mahjong Wins 3 \\u2013 Black Scatter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Mahjong%20Wins%203%20\u2013%20Black%20Scatter.webp' },
            { name: 'Mahjong Wins Super Scatter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Mahjong%20Wins%20Super%20Scatter.webp' },
            { name: 'Spellbinding Mystery\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Spellbinding%20Mystery\u2122.webp' },
            { name: 'Savannah Legend', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Savannah%20Legend.webp' },
            { name: 'Money Mouse', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Money%20Mouse.webp' },
            { name: 'Heist for the Golden Nugget\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Heist%20for%20the%20Golden%20Nugget\u2122.webp' },
            { name: 'Monster Superlanche\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Monster%20Superlanche\u2122.webp' },
            { name: 'Irish Crown', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Irish%20Crown.webp' },
            { name: 'Beware The Deep Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Beware%20The%20Deep%20Megaways.webp' },
            { name: 'Bigger Bass Bonanza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Bigger%20Bass%20Bonanza.webp' },
            { name: 'Ancient Island Megaways\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Ancient%20Island%20Megaways\u2122.webp' },
            { name: 'Loki\\\'s Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Loki\%27s%20Riches.webp' },
            { name: 'Crystal Caverns Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Crystal%20Caverns%20Megaways.webp' },
            { name: 'Gates of Gatot Kaca', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Gates%20of%20Gatot%20Kaca.webp' },
            { name: 'Wild Pixies', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Wild%20Pixies.webp' },
            { name: 'Bonanza Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Bonanza%20Gold.webp' },
            { name: 'Gems of Serengeti\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Gems%20of%20Serengeti\u2122.webp' },
            { name: 'Rainbow Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Rainbow%20Gold.webp' },
            { name: 'Sweet Powernudge\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Sweet%20Powernudge\u2122.webp' },
            { name: 'Kingdom of Asgard', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Kingdom%20of%20Asgard.webp' },
            { name: 'Jewel Rush\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Jewel%20Rush\u2122.webp' },
            { name: 'Joker Race', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Joker%20Race.webp' },
            { name: 'Club Tropicana\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Club%20Tropicana\u2122.webp' },
            { name: 'Lucky New Year - Tiger Treasures', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Lucky%20New%20Year%20-%20Tiger%20Treasures.webp' },
            { name: 'Wild Celebrity Bus Megaways\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Wild%20Celebrity%20Bus%20Megaways\u2122.webp' },
            { name: 'Irish Charms', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Irish%20Charms.webp' },
            { name: 'Great Rhino Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Great%20Rhino%20Deluxe.webp' },
            { name: 'The Money Men Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/The%20Money%20Men%20Megaways.webp' },
            { name: 'Return of the Dead', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Return%20of%20the%20Dead.webp' },
            { name: 'Revenge of Loki Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Revenge%20of%20Loki%20Megaways.webp' },
            { name: 'Voodoo Magic', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Voodoo%20Magic.webp' },
            { name: 'Running Sushi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Running%20Sushi.webp' },
            { name: 'Pirate Gold Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Pirate%20Gold%20Deluxe.webp' },
            { name: 'Strawberry Cocktail', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Strawberry%20Cocktail.webp' },
            { name: 'The Great Chicken Escape', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/The%20Great%20Chicken%20Escape.webp' },
            { name: 'Muertos Multiplier Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Muertos%20Multiplier%20Megaways.webp' },
            { name: 'Rise of Samurai Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Rise%20of%20Samurai%20Megaways.webp' },
            { name: 'Frogs & Bugs', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Frogs%20&%20Bugs.webp' },
            { name: 'Dance Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Dance%20Party.webp' },
            { name: 'John Hunter and the Book of Tut', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/John%20Hunter%20and%20the%20Book%20of%20Tut.webp' },
            { name: 'Gates of Olympus Dice', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Gates%20of%20Olympus%20Dice.webp' },
            { name: 'The Red Queen\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/The%20Red%20Queen\u2122.webp' },
            { name: 'Bigger Bass Splash', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Bigger%20Bass%20Splash.webp' },
            { name: 'Money Money Money', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Money%20Money%20Money.webp' },
            { name: 'Gates of Olympus 1000', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Gates%20of%20Olympus%201000.webp' },
            { name: 'Wild Gladiator', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Wild%20Gladiator.webp' },
            { name: 'Hercules Son Of Zeus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Hercules%20Son%20Of%20Zeus.webp' },
            { name: 'The Hand of Midas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/The%20Hand%20of%20Midas.webp' },
            { name: 'Fire Strike', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fire%20Strike.webp' },
            { name: 'Dragon Kingdom', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Dragon%20Kingdom.webp' },
            { name: 'Fonzo\\u2019s Feline Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fonzo\u2019s%20Feline%20Fortunes.webp' },
            { name: 'Barnyard Megahays Megaways\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Barnyard%20Megahays%20Megaways\u2122.webp' },
            { name: 'Big Bass Vegas Double Down Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Big%20Bass%20Vegas%20Double%20Down%20Deluxe.webp' },
            { name: 'Fish Eye', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fish%20Eye.webp' },
            { name: 'Fortune of Giza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fortune%20of%20Giza.webp' },
            { name: 'Super 7s', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Super%207s.webp' },
            { name: 'Oodles of Noodles', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Oodles%20of%20Noodles.webp' },
            { name: 'Yum Yum Powerways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Yum%20Yum%20Powerways.webp' },
            { name: 'Treasure Wild', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Treasure%20Wild.webp' },
            { name: 'Money Stacks Dice', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Money%20Stacks%20Dice.webp' },
            { name: 'Trees of Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Trees%20of%20Treasure.webp' },
            { name: 'Sticky Bees\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Sticky%20Bees\u2122.webp' },
            { name: 'Big Juan', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Big%20Juan.webp' },
            { name: 'Gates of Gatot Kaca 1000', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Gates%20of%20Gatot%20Kaca%201000.webp' },
            { name: 'Congo Cash XL', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Congo%20Cash%20XL.webp' },
            { name: 'Fruit Rainbow', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fruit%20Rainbow.webp' },
            { name: 'Fortunes of the Aztec\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fortunes%20of%20the%20Aztec\u2122.webp' },
            { name: 'Mysterious', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Mysterious.webp' },
            { name: 'Fishin Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Fishin%20Reels.webp' },
            { name: 'Big Bass Mission Fishin\\\'', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PRAGMATIC/Big%20Bass%20Mission%20Fishin\%27.webp' },
        ]
    },
    jili: {
        name: 'JILI',
        code: 'JILI',
        logo: CDN_PROVIDER + 'JILI.png',
        games: [
            { name: 'Go Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Go%20Rush.webp' },
            { name: 'Ultimate Texas Hold\\\'em', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Ultimate%20Texas%20Hold\%27em.webp' },
            { name: 'Caribbean Stud Poker', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Caribbean%20Stud%20Poker.webp' },
            { name: 'Rummy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Rummy.webp' },
            { name: 'PAPPU', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/PAPPU.webp' },
            { name: 'Crazy Hunter 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crazy%20Hunter%202.webp' },
            { name: 'Crash Goal', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crash%20Goal.webp' },
            { name: 'Coin Tree', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Coin%20Tree.webp' },
            { name: 'King Arthur', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/King%20Arthur.webp' },
            { name: '3 Pot Dragons', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/3%20Pot%20Dragons.webp' },
            { name: 'Super E-Sabong', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Super%20E-Sabong.webp' },
            { name: 'Dinosaur Tycoon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Dinosaur%20Tycoon.webp' },
            { name: 'Dragon & Tiger', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Dragon%20&%20Tiger.webp' },
            { name: 'Lucky Number', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Lucky%20Number.webp' },
            { name: 'Plinko', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Plinko.webp' },
            { name: 'Keno', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Keno.webp' },
            { name: 'Crash Bonus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crash%20Bonus.webp' },
            { name: 'Number King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Number%20King.webp' },
            { name: 'Arena Fighter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Arena%20Fighter.webp' },
            { name: 'Cricket Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Cricket%20Roulette.webp' },
            { name: 'Samba', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Samba.webp' },
            { name: 'Crazy Pusher', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crazy%20Pusher.webp' },
            { name: 'Gold Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Gold%20Rush.webp' },
            { name: 'Xiyangyang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Xiyangyang.webp' },
            { name: 'Devil Fire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Devil%20Fire.webp' },
            { name: 'Cricket Sah 75', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Cricket%20Sah%2075.webp' },
            { name: '7up7down', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/7up7down.webp' },
            { name: 'Tower', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Tower.webp' },
            { name: 'Fortune Gems 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fortune%20Gems%202.webp' },
            { name: 'Money Coming Expand Bets', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Money%20Coming%20Expand%20Bets.webp' },
            { name: 'Dice', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Dice.webp' },
            { name: 'Fortune Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fortune%20Bingo.webp' },
            { name: 'Wild Racer', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Wild%20Racer.webp' },
            { name: 'Pharaoh Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Pharaoh%20Treasure.webp' },
            { name: 'Crazy777', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crazy777.webp' },
            { name: 'Shanghai Beauty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Shanghai%20Beauty.webp' },
            { name: 'Ak47', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Ak47.webp' },
            { name: 'Sin City', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Sin%20City.webp' },
            { name: 'Sevensevenseven', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Sevensevenseven.webp' },
            { name: 'European Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/European%20Roulette.webp' },
            { name: 'Money Pot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Money%20Pot.webp' },
            { name: 'Boxing King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Boxing%20King.webp' },
            { name: 'Go Goal Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Go%20Goal%20Bingo.webp' },
            { name: 'Andar Bahar', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Andar%20Bahar.webp' },
            { name: 'HILO', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/HILO.webp' },
            { name: 'Thai Hilo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Thai%20Hilo.webp' },
            { name: 'Lucky Jaguar', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Lucky%20Jaguar.webp' },
            { name: 'Fa Fa Fa', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fa%20Fa%20Fa.webp' },
            { name: 'Wheel', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Wheel.webp' },
            { name: 'Sweet Land', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Sweet%20Land.webp' },
            { name: '3 Lucky Piggy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/3%20Lucky%20Piggy.webp' },
            { name: '3 Coin Treasures', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/3%20Coin%20Treasures.webp' },
            { name: 'Baccarat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Baccarat.webp' },
            { name: 'Fairness Games', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fairness%20Games.webp' },
            { name: 'Bingo Carnaval', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Bingo%20Carnaval.webp' },
            { name: 'All-star Fishing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/All-star%20Fishing.webp' },
            { name: 'Irich Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Irich%20Bingo.webp' },
            { name: 'Lucky Goldbricks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Lucky%20Goldbricks.webp' },
            { name: 'Fortunepig', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fortunepig.webp' },
            { name: 'Jackpot Joker', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Jackpot%20Joker.webp' },
            { name: 'Candy Baby', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Candy%20Baby.webp' },
            { name: 'Charge Buffalo Ascent', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Charge%20Buffalo%20Ascent.webp' },
            { name: 'Mayan Empire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Mayan%20Empire.webp' },
            { name: 'West Hunter Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/West%20Hunter%20Bingo.webp' },
            { name: 'Chin Shi Huang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Chin%20Shi%20Huang.webp' },
            { name: 'Dabanggg', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Dabanggg.webp' },
            { name: 'Golden Bank 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Golden%20Bank%202.webp' },
            { name: 'Poker King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Poker%20King.webp' },
            { name: 'MINI FLUSH', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/MINI%20FLUSH.webp' },
            { name: 'Thor X', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Thor%20X.webp' },
            { name: 'Boxing Extravaganza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Boxing%20Extravaganza.webp' },
            { name: 'Fengshen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Fengshen.webp' },
            { name: 'Crazy Golden Bank', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crazy%20Golden%20Bank.webp' },
            { name: 'Speed Baccarat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Speed%20Baccarat.webp' },
            { name: 'Crazy Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Crazy%20Hunter.webp' },
            { name: 'Bingo Adventure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Bingo%20Adventure.webp' },
            { name: 'Pearls of Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Pearls%20of%20Bingo.webp' },
            { name: 'Egypt\\\'s Glow', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Egypt\%27s%20Glow.webp' },
            { name: 'Win Drop', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Win%20Drop.webp' },
            { name: 'Lucky Coming', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JILI/Lucky%20Coming.webp' },
        ]
    },
    mega888: {
        name: 'MEGA888',
        code: 'ME',
        logo: CDN_PROVIDER + 'MEGA888.png',
        games: [{ name: 'Bonus Bears', img: '' }, { name: 'Monkey King', img: '' }]
    },
    pussy888: {
        name: 'PUSSY888',
        code: 'PU',
        logo: CDN_PROVIDER + 'PUSSY888.png',
        games: [{ name: 'Bonus Bears', img: '' }, { name: 'Monkey King', img: '' }]
    },
    918kiss: {
        name: '918KISS',
        code: '91',
        logo: CDN_PROVIDER + '918KISS.png',
        games: [{ name: 'Bonus Bears', img: '' }, { name: 'Monkey King', img: '' }]
    },
    pgsoft: {
        name: 'PGSOFT',
        code: 'PG',
        logo: CDN_PROVIDER + 'PG.png',
        games: [
            { name: 'Leprechaun Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Leprechaun%20Riches.webp' },
            { name: 'Mahjong Ways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Mahjong%20Ways.webp' },
            { name: 'Treasures Of Aztec', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Treasures%20Of%20Aztec.webp' },
            { name: 'Lucky Neko', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Lucky%20Neko.webp' },
            { name: 'Double Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Double%20Fortune.webp' },
            { name: 'The Great Icescape', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/The%20Great%20Icescape.webp' },
            { name: 'Captain\\u2019s Bounty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Captain\u2019s%20Bounty.webp' },
            { name: 'Caishen Wins', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Caishen%20Wins.webp' },
            { name: 'Ganesha Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Ganesha%20Fortune.webp' },
            { name: 'Dreams Of Macau', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Dreams%20Of%20Macau.webp' },
            { name: 'Queen Of Bounty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Queen%20Of%20Bounty.webp' },
            { name: 'Fortune Ox', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Fortune%20Ox.webp' },
            { name: 'Wild Bandito', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Wild%20Bandito.webp' },
            { name: 'Ways Of The Qilin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Ways%20Of%20The%20Qilin.webp' },
            { name: 'Dragon Hatch', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Dragon%20Hatch.webp' },
            { name: 'Egypt\\u2019s Book Of Mystery', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Egypt\u2019s%20Book%20Of%20Mystery.webp' },
            { name: 'Phoenix Rises', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Phoenix%20Rises.webp' },
            { name: 'Wild Fireworks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Wild%20Fireworks.webp' },
            { name: 'Thai River Wonders', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Thai%20River%20Wonders.webp' },
            { name: 'Bali Vacation', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Bali%20Vacation.webp' },
            { name: 'Crypto Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Crypto%20Gold.webp' },
            { name: 'Honey Trap Of Diao Chan', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Honey%20Trap%20Of%20Diao%20Chan.webp' },
            { name: 'Fortune Gods', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Fortune%20Gods.webp' },
            { name: 'Win Win Won', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Win%20Win%20Won.webp' },
            { name: 'Medusa Ii', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Medusa%20Ii.webp' },
            { name: 'Tree Of Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Tree%20Of%20Fortune.webp' },
            { name: 'Medusa', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Medusa.webp' },
            { name: 'Plushie Frenzy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Plushie%20Frenzy.webp' },
            { name: 'Wizdom Wonders', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Wizdom%20Wonders.webp' },
            { name: 'Gem Saviour', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Gem%20Saviour.webp' },
            { name: 'Hood Vs Wolf', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Hood%20Vs%20Wolf.webp' },
            { name: 'Hotpot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Hotpot.webp' },
            { name: 'Dragon Legend', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Dragon%20Legend.webp' },
            { name: 'Mr. Hallow-Win', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Mr.%20Hallow-Win.webp' },
            { name: 'Legend Of Hou Yi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Legend%20Of%20Hou%20Yi.webp' },
            { name: 'Prosperity Lion', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Prosperity%20Lion.webp' },
            { name: 'Hip Hop Panda', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Hip%20Hop%20Panda.webp' },
            { name: 'Santa\\u2019s Gift Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Santa\u2019s%20Gift%20Rush.webp' },
            { name: 'Baccarat Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Baccarat%20Deluxe.webp' },
            { name: 'Gem Saviour Sword', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Gem%20Saviour%20Sword.webp' },
            { name: 'Piggy Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Piggy%20Gold.webp' },
            { name: 'Emperor\\u2019s Favour', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Emperor\u2019s%20Favour.webp' },
            { name: 'Ganesha Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Ganesha%20Gold.webp' },
            { name: 'Three Monkeys', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Three%20Monkeys.webp' },
            { name: 'Jungle Delight', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Jungle%20Delight.webp' },
            { name: 'Journey To The Wealth', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Journey%20To%20The%20Wealth.webp' },
            { name: 'Flirting Scholar', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Flirting%20Scholar.webp' },
            { name: 'Ninja Vs Samurai', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Ninja%20Vs%20Samurai.webp' },
            { name: 'Muay Thai Champion', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Muay%20Thai%20Champion.webp' },
            { name: 'Dragon Tiger Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Dragon%20Tiger%20Luck.webp' },
            { name: 'Fortune Mouse', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Fortune%20Mouse.webp' },
            { name: 'Reel Love', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Reel%20Love.webp' },
            { name: 'Gem Saviour Conquest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Gem%20Saviour%20Conquest.webp' },
            { name: 'Shaolin Soccer', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Shaolin%20Soccer.webp' },
            { name: 'Candy Burst', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Candy%20Burst.webp' },
            { name: 'Bikini Paradise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Bikini%20Paradise.webp' },
            { name: 'Genie\\u2019s 3 Wishes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Genie\u2019s%203%20Wishes.webp' },
            { name: 'Circus Delight', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Circus%20Delight.webp' },
            { name: 'Secrets Of Cleopatra', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Secrets%20Of%20Cleopatra.webp' },
            { name: 'Vampire\\u2019s Charm', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Vampire\u2019s%20Charm.webp' },
            { name: 'Jewels Of Prosperity', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Jewels%20Of%20Prosperity.webp' },
            { name: 'Jack Frost\\u2019s Winter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Jack%20Frost\u2019s%20Winter.webp' },
            { name: 'Galactic Gems', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Galactic%20Gems.webp' },
            { name: 'Guardians Of Ice And Fire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Guardians%20Of%20Ice%20And%20Fire.webp' },
            { name: 'Opera Dynasty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Opera%20Dynasty.webp' },
            { name: 'Majestic Treasures', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Majestic%20Treasures.webp' },
            { name: 'Candy Bonanza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Candy%20Bonanza.webp' },
            { name: 'Heist Stakes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Heist%20Stakes.webp' },
            { name: 'Rise Of Apollo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Rise%20Of%20Apollo.webp' },
            { name: 'Sushi Oishi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Sushi%20Oishi.webp' },
            { name: 'Jurassic Kingdom', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Jurassic%20Kingdom.webp' },
            { name: 'Mermaid Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Mermaid%20Riches.webp' },
            { name: 'Groundhog Harvest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Groundhog%20Harvest.webp' },
            { name: 'Raider Jane\\u2019s Crypt Of Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Raider%20Jane\u2019s%20Crypt%20Of%20Fortune.webp' },
            { name: 'Supermarket Spree', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Supermarket%20Spree.webp' },
            { name: 'Buffalo Win', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Buffalo%20Win.webp' },
            { name: 'Legendary Monkey King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Legendary%20Monkey%20King.webp' },
            { name: 'Spirited Wonders', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Spirited%20Wonders.webp' },
            { name: 'Farm Invaders', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Farm%20Invaders.webp' },
            { name: 'Emoji Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PG/Emoji%20Riches.webp' },
        ]
    },
    joker: {
        name: 'JOKER',
        code: 'JKR',
        logo: CDN_PROVIDER + 'JKR.png',
        games: [
            { name: 'China', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/China.webp' },
            { name: 'Sicbo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Sicbo.webp' },
            { name: 'Sweetie Crush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Sweetie%20Crush.webp' },
            { name: 'Trick Or Treat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Trick%20Or%20Treat.webp' },
            { name: 'Masquerade', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Masquerade.webp' },
            { name: 'Koi Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Koi%20Bingo.webp' },
            { name: 'Football Strike', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Football%20Strike.webp' },
            { name: 'Lucky Lady Charm', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Lucky%20Lady%20Charm.webp' },
            { name: 'Number Game', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Number%20Game.webp' },
            { name: 'Horus Eye', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Horus%20Eye.webp' },
            { name: 'Enter The KTV', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Enter%20The%20KTV.webp' },
            { name: 'Mythical Sand', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Mythical%20Sand.webp' },
            { name: 'Lucky Drum', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Lucky%20Drum.webp' },
            { name: 'Ancient Rome Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Ancient%20Rome%20Deluxe.webp' },
            { name: 'Lions Dance', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Lions%20Dance.webp' },
            { name: 'Santa\\\'s Workshop', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Santa\%27s%20Workshop.webp' },
            { name: 'Hot Fruits', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Hot%20Fruits.webp' },
            { name: 'Fish Hunter 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Hunter%202.webp' },
            { name: 'Happy Buddha', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Happy%20Buddha.webp' },
            { name: 'Forest Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Forest%20Treasure.webp' },
            { name: 'Feng Huang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Feng%20Huang.webp' },
            { name: 'The 4 Invention', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/The%204%20Invention.webp' },
            { name: 'Three Kingdoms 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Three%20Kingdoms%202.webp' },
            { name: 'Fortune Festival', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fortune%20Festival.webp' },
            { name: 'Safari Life', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Safari%20Life.webp' },
            { name: 'Fish Hunter 2 EX - Newbie', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Hunter%202%20EX%20-%20Newbie.webp' },
            { name: 'Columbus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Columbus.webp' },
            { name: 'Dragon Power Flame', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Dragon%20Power%20Flame.webp' },
            { name: 'Streets Of Chicago', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Streets%20Of%20Chicago.webp' },
            { name: 'Mayan Gems', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Mayan%20Gems.webp' },
            { name: 'Ancient Artifact', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Ancient%20Artifact.webp' },
            { name: 'Critter Mania Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Critter%20Mania%20Deluxe.webp' },
            { name: 'Ni Shu Shen Me', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Ni%20Shu%20Shen%20Me.webp' },
            { name: 'Captain\\\'s Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Captain\%27s%20Treasure.webp' },
            { name: 'Journey To The West', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Journey%20To%20The%20West.webp' },
            { name: 'Four Tigers', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Four%20Tigers.webp' },
            { name: 'Pubg', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Pubg.webp' },
            { name: 'Mulan', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Mulan.webp' },
            { name: 'Football Rules', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Football%20Rules.webp' },
            { name: 'Fei Long Zai Tian', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fei%20Long%20Zai%20Tian.webp' },
            { name: 'Geisha', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Geisha.webp' },
            { name: 'Panther Moon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Panther%20Moon.webp' },
            { name: 'Burning Pearl', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Burning%20Pearl.webp' },
            { name: 'Lucky Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Lucky%20Roulette.webp' },
            { name: 'Fish Hunter Wukong', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Hunter%20Wukong.webp' },
            { name: 'Cash Or Crash', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Cash%20Or%20Crash.webp' },
            { name: 'Bird Paradise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Bird%20Paradise.webp' },
            { name: 'Fish Raiden Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Raiden%20Hunter.webp' },
            { name: 'Octagon Gem 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Octagon%20Gem%202.webp' },
            { name: 'Werewolf', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Werewolf.webp' },
            { name: 'Choy Sun Doa', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Choy%20Sun%20Doa.webp' },
            { name: 'Insect Paradise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Insect%20Paradise.webp' },
            { name: 'Tai Shang Lao Jun', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Tai%20Shang%20Lao%20Jun.webp' },
            { name: 'Chilli Hunter Bingo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Chilli%20Hunter%20Bingo.webp' },
            { name: 'Golden Dragon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Golden%20Dragon.webp' },
            { name: 'Dragon\\\'s Realm', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Dragon\%27s%20Realm.webp' },
            { name: 'Wild Giant Panda', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Wild%20Giant%20Panda.webp' },
            { name: 'Angel And Devil', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Angel%20And%20Devil.webp' },
            { name: 'Great Blue', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Great%20Blue.webp' },
            { name: 'Gold Trail', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Gold%20Trail.webp' },
            { name: 'Mythological', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Mythological.webp' },
            { name: 'Fish Hunter - The Mosaic Gold Dragon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Hunter%20-%20The%20Mosaic%20Gold%20Dragon.webp' },
            { name: 'Yeh Hsien Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Yeh%20Hsien%20Deluxe.webp' },
            { name: 'Nugget Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Nugget%20Hunter.webp' },
            { name: 'Panda Master', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Panda%20Master.webp' },
            { name: 'Three Kingdoms Quest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Three%20Kingdoms%20Quest.webp' },
            { name: 'Ong Bak 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Ong%20Bak%202.webp' },
            { name: 'Dragon Of The Eastern Sea', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Dragon%20Of%20The%20Eastern%20Sea.webp' },
            { name: 'Neptune Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Neptune%20Treasure.webp' },
            { name: 'Santa Surprise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Santa%20Surprise.webp' },
            { name: 'Fish Galaxy Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Fish%20Galaxy%20Hunter.webp' },
            { name: 'Bonus Bear', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Bonus%20Bear.webp' },
            { name: 'Huga', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Huga.webp' },
            { name: 'Dolphin Reef', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Dolphin%20Reef.webp' },
            { name: 'Peach Banquet', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Peach%20Banquet.webp' },
            { name: 'Dolphins Pearl Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Dolphins%20Pearl%20Deluxe.webp' },
            { name: 'Flames Of Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Flames%20Of%20Fortune.webp' },
            { name: 'Lucky Streak', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Lucky%20Streak.webp' },
            { name: 'Four Dragons', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Four%20Dragons.webp' },
            { name: 'Thai HiLo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/JKR/Thai%20HiLo.webp' },
        ]
    },
    spadegaming: {
        name: 'SPADEGAMING',
        code: 'SPADEGAMING',
        logo: CDN_PROVIDER + 'SPADEGAMING.png',
        games: [
            { name: 'Christmas Miracles', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Christmas%20Miracles.webp' },
            { name: 'Fishing God', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fishing%20God.webp' },
            { name: 'Zombie Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Zombie%20Party.webp' },
            { name: 'Fishing War', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fishing%20War.webp' },
            { name: 'Alien Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Alien%20Hunter.webp' },
            { name: 'Panda Opera', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Panda%20Opera.webp' },
            { name: 'Halloween Vacation', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Halloween%20Vacation.webp' },
            { name: 'Legacy of Kong Maxways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Legacy%20of%20Kong%20Maxways.webp' },
            { name: 'Sugar Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Sugar%20Party.webp' },
            { name: 'Captain Golds Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Captain%20Golds%20Fortune.webp' },
            { name: 'Journey to the Wild', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Journey%20to%20the%20Wild.webp' },
            { name: 'Fruits Mania', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fruits%20Mania.webp' },
            { name: 'Gold Panther Maxways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Gold%20Panther%20Maxways.webp' },
            { name: 'Space Conquest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Space%20Conquest.webp' },
            { name: 'Caishen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Caishen.webp' },
            { name: 'Fiery Sevens Exclusive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fiery%20Sevens%20Exclusive.webp' },
            { name: 'Lucky Koi Exclusive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Lucky%20Koi%20Exclusive.webp' },
            { name: 'Jokers Treasure Exclusive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Jokers%20Treasure%20Exclusive.webp' },
            { name: 'Tiger Dance', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Tiger%20Dance.webp' },
            { name: 'Royale House', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Royale%20House.webp' },
            { name: 'Sexy Vegas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Sexy%20Vegas.webp' },
            { name: 'Roma', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Roma.webp' },
            { name: 'Candy Candy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Candy%20Candy.webp' },
            { name: 'Gold Rush Cowboys', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Gold%20Rush%20Cowboys.webp' },
            { name: 'Wild Wet Win', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Wild%20Wet%20Win.webp' },
            { name: 'Royal Katt', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Royal%20Katt.webp' },
            { name: 'Rich Caishen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Rich%20Caishen.webp' },
            { name: 'Muay Thai Fighter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Muay%20Thai%20Fighter.webp' },
            { name: 'Poker Ways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Poker%20Ways.webp' },
            { name: 'Ruby Hood', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Ruby%20Hood.webp' },
            { name: 'Love Idol', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Love%20Idol.webp' },
            { name: 'Magic Kitty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Magic%20Kitty.webp' },
            { name: 'Sugar Bonanza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Sugar%20Bonanza.webp' },
            { name: 'Kungfu Dragon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Kungfu%20Dragon.webp' },
            { name: 'Hugon Quest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Hugon%20Quest.webp' },
            { name: 'Legendary Beasts Saga', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Legendary%20Beasts%20Saga.webp' },
            { name: 'Moodie Foodie', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Moodie%20Foodie.webp' },
            { name: 'Rise Of Werewolves', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Rise%20Of%20Werewolves.webp' },
            { name: 'Mayan Gems', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Mayan%20Gems.webp' },
            { name: 'Crazy Bomber', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Crazy%20Bomber.webp' },
            { name: 'Fiery Sevens', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fiery%20Sevens.webp' },
            { name: 'Mega 7', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Mega%207.webp' },
            { name: 'Jokers Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Jokers%20Treasure.webp' },
            { name: 'Double Flame', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Double%20Flame.webp' },
            { name: 'Wong Choy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Wong%20Choy.webp' },
            { name: 'Book of Myth', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Book%20of%20Myth.webp' },
            { name: 'Money Mouse', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Money%20Mouse.webp' },
            { name: 'Dragon Empire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Dragon%20Empire.webp' },
            { name: '888', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/888.webp' },
            { name: 'Three Lucky Stars', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Three%20Lucky%20Stars.webp' },
            { name: 'Heroes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Heroes.webp' },
            { name: 'Sweet Bakery', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Sweet%20Bakery.webp' },
            { name: 'Dancing Fever', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Dancing%20Fever.webp' },
            { name: 'Magical Lamp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Magical%20Lamp.webp' },
            { name: 'Triple Panda', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Triple%20Panda.webp' },
            { name: 'Gold Panther', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Gold%20Panther.webp' },
            { name: 'Mr Chu Tycoon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Mr%20Chu%20Tycoon.webp' },
            { name: 'Brothers kingdom', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Brothers%20kingdom.webp' },
            { name: 'Prosperity Gods', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Prosperity%20Gods.webp' },
            { name: 'Candy Pop', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Candy%20Pop.webp' },
            { name: 'Golden Fist', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Golden%20Fist.webp' },
            { name: 'FaFaFa2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/FaFaFa2.webp' },
            { name: 'Gangster Axe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Gangster%20Axe.webp' },
            { name: 'Princess Wang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Princess%20Wang.webp' },
            { name: 'Wow Prosperity', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Wow%20Prosperity.webp' },
            { name: 'First Love', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/First%20Love.webp' },
            { name: 'Golden Monkey', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Golden%20Monkey.webp' },
            { name: 'Jungle King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Jungle%20King.webp' },
            { name: 'Pan Fairy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Pan%20Fairy.webp' },
            { name: 'ShangHai 008', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/ShangHai%20008.webp' },
            { name: 'Fist of Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Fist%20of%20Gold.webp' },
            { name: 'Tiger Warrior', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Tiger%20Warrior.webp' },
            { name: 'Sea Emperor', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Sea%20Emperor.webp' },
            { name: 'ZEUS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/ZEUS.webp' },
            { name: 'Ho Yeah Monkey', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Ho%20Yeah%20Monkey.webp' },
            { name: 'Golden Chicken', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Golden%20Chicken.webp' },
            { name: '5 Fortune SA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/5%20Fortune%20SA.webp' },
            { name: 'Big Prosperity SA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Big%20Prosperity%20SA.webp' },
            { name: 'Dragon Gold SA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Dragon%20Gold%20SA.webp' },
            { name: 'Emperor Gate SA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/SPADEGAMING/Emperor%20Gate%20SA.webp' },
        ]
    },
    playtech: {
        name: 'PLAYTECH',
        code: 'PLAYTECH',
        logo: CDN_PROVIDER + 'PLAYTECH.png',
        games: [
            { name: '1000 Diamond Bet Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/1000%20Diamond%20Bet%20Roulette.webp' },
            { name: 'Clover Rollover 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Clover%20Rollover%202.webp' },
            { name: 'Jurassic Island', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Jurassic%20Island.webp' },
            { name: 'The Glass Slipper', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/The%20Glass%20Slipper.webp' },
            { name: 'Secret Garden', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Secret%20Garden.webp' },
            { name: 'Chests of Plenty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Chests%20of%20Plenty.webp' },
            { name: 'White Wizard Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/White%20Wizard%20Deluxe.webp' },
            { name: 'Lucha Rumble', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Lucha%20Rumble.webp' },
            { name: 'Xingyun BaoZhu', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Xingyun%20BaoZhu.webp' },
            { name: 'Bouncy Balls 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Bouncy%20Balls%202.webp' },
            { name: 'Selfie Elfie', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Selfie%20Elfie.webp' },
            { name: 'Blackjack Surrender', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Blackjack%20Surrender.webp' },
            { name: 'Blackjack Switch', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Blackjack%20Switch.webp' },
            { name: 'Puggy Payout', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Puggy%20Payout.webp' },
            { name: 'Sun WuKong', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Sun%20WuKong.webp' },
            { name: 'Eternal Lady', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Eternal%20Lady.webp' },
            { name: 'Nian Nian You Yu', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Nian%20Nian%20You%20Yu.webp' },
            { name: 'Esmeralda', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Esmeralda.webp' },
            { name: 'Fire Blaze: Red Wizard', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Fire%20Blaze:%20Red%20Wizard.webp' },
            { name: 'Thai Temple', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Thai%20Temple.webp' },
            { name: 'Azteca: Bonus Lines', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Azteca:%20Bonus%20Lines.webp' },
            { name: 'Power Zones: Thunder Birds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Power%20Zones:%20Thunder%20Birds.webp' },
            { name: 'Golden Glyph 3', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Golden%20Glyph%203.webp' },
            { name: 'Oink Oink Oink', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Oink%20Oink%20Oink.webp' },
            { name: 'Azteca: Cash Collect', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Azteca:%20Cash%20Collect.webp' },
            { name: 'Gold Hit: Shrine of Anubis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Gold%20Hit:%20Shrine%20of%20Anubis.webp' },
            { name: 'White King II', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/White%20King%20II.webp' },
            { name: 'Pumpkin Bonanza', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Pumpkin%20Bonanza.webp' },
            { name: 'Cat in Vegas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Cat%20in%20Vegas.webp' },
            { name: 'Witches: Cash Collect', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Witches:%20Cash%20Collect.webp' },
            { name: 'Dragon Chi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Dragon%20Chi.webp' },
            { name: 'Arowanas Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Arowanas%20Luck.webp' },
            { name: 'Quad Link Count', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Quad%20Link%20Count.webp' },
            { name: 'Gold Trio', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Gold%20Trio.webp' },
            { name: 'Lunar Link: Sky King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Lunar%20Link:%20Sky%20King.webp' },
            { name: 'Fire Blaze: Pearls Pearls Pearls', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Fire%20Blaze:%20Pearls%20Pearls%20Pearls.webp' },
            { name: 'Pyramid Valley: Power Zones', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Pyramid%20Valley:%20Power%20Zones.webp' },
            { name: 'Ways of the Phoenix', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Ways%20of%20the%20Phoenix.webp' },
            { name: 'Cash Truck 3 Turbo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Cash%20Truck%203%20Turbo.webp' },
            { name: 'Fruit Mania', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Fruit%20Mania.webp' },
            { name: 'Candy Roll', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Candy%20Roll.webp' },
            { name: 'Easter Surprise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Easter%20Surprise.webp' },
            { name: 'Lil Demon: Mega Cash Collect', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Lil%20Demon:%20Mega%20Cash%20Collect.webp' },
            { name: 'Tiger Stacks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Tiger%20Stacks.webp' },
            { name: 'Miss Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Miss%20Fortune.webp' },
            { name: 'Grand Junction: Golden Guns', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Grand%20Junction:%20Golden%20Guns.webp' },
            { name: 'Football Rules', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Football%20Rules.webp' },
            { name: 'Golden Ways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Golden%20Ways.webp' },
            { name: 'Honey Gems', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Honey%20Gems.webp' },
            { name: 'Age of the Gods Scratch', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Age%20of%20the%20Gods%20Scratch.webp' },
            { name: 'Liu Fu Shou', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Liu%20Fu%20Shou.webp' },
            { name: 'Lucky Lucky Blackjack', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Lucky%20Lucky%20Blackjack.webp' },
            { name: 'Queen\\\'s Mystery', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Queen\%27s%20Mystery.webp' },
            { name: 'Record Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Record%20Riches.webp' },
            { name: 'Big Bad Wolf', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Big%20Bad%20Wolf.webp' },
            { name: 'Mayan Blocks PowerPlay Jackpot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Mayan%20Blocks%20PowerPlay%20Jackpot.webp' },
            { name: 'Ugga Bugga', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Ugga%20Bugga.webp' },
            { name: 'Pinball Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Pinball%20Roulette.webp' },
            { name: 'Premium European Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Premium%20European%20Roulette.webp' },
            { name: 'Hit me Baccarat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Hit%20me%20Baccarat.webp' },
            { name: 'Cashback Blackjack', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Cashback%20Blackjack.webp' },
            { name: 'Age of the Gods Spin A Win', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Age%20of%20the%20Gods%20Spin%20A%20Win.webp' },
            { name: 'Juicy Booty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Juicy%20Booty.webp' },
            { name: 'Autumn Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Autumn%20Gold.webp' },
            { name: 'Irish Luck(Eyecon)', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Irish%20Luck(Eyecon).webp' },
            { name: 'Nian Nian You Yu Asia', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Nian%20Nian%20You%20Yu%20Asia.webp' },
            { name: 'Bombs', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Bombs.webp' },
            { name: 'Fireworks Frenzy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Fireworks%20Frenzy.webp' },
            { name: 'Ji Xiang 8', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Ji%20Xiang%208.webp' },
            { name: 'Kitty Payout', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Kitty%20Payout.webp' },
            { name: 'The Perfect Heist', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/The%20Perfect%20Heist.webp' },
            { name: 'Galactic Girls', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Galactic%20Girls.webp' },
            { name: 'Piggy Payout', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Piggy%20Payout.webp' },
            { name: 'Very Merry Christmas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Very%20Merry%20Christmas.webp' },
            { name: 'Stampede', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Stampede.webp' },
            { name: 'Pigs Feast', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Pigs%20Feast.webp' },
            { name: 'Stepback 7s', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Stepback%207s.webp' },
            { name: 'Football Carnival', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Football%20Carnival.webp' },
            { name: 'Beez Kneez', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Beez%20Kneez.webp' },
            { name: 'Shopping Spree', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/PLAYTECH/Shopping%20Spree.webp' },
        ]
    },
    fachai: {
        name: 'FACHAI',
        code: 'FC',
        logo: CDN_PROVIDER + 'FC.png',
        games: [
            { name: 'BOXING RICHES', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/BOXING%20RICHES.webp' },
            { name: 'POKER WIN', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/POKER%20WIN.webp' },
            { name: 'CHINESE NEW YEAR MOREWAYS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CHINESE%20NEW%20YEAR%20MOREWAYS.webp' },
            { name: 'ROMA GLADIATRIX', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/ROMA%20GLADIATRIX.webp' },
            { name: 'FORTUNE GODDESS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FORTUNE%20GODDESS.webp' },
            { name: 'QUEEN OF INCA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/QUEEN%20OF%20INCA.webp' },
            { name: 'SUGAR BANG BANG', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/SUGAR%20BANG%20BANG.webp' },
            { name: 'NIGHT MARKET', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/NIGHT%20MARKET.webp' },
            { name: 'CHINESE NEW YEAR', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CHINESE%20NEW%20YEAR.webp' },
            { name: 'CHINESE NEW YEAR 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CHINESE%20NEW%20YEAR%202.webp' },
            { name: 'LUCKY FORTUNES', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/LUCKY%20FORTUNES.webp' },
            { name: 'GOLDEN GENIE', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/GOLDEN%20GENIE.webp' },
            { name: 'LUCKY FORTUNES 3x3', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/LUCKY%20FORTUNES%203x3.webp' },
            { name: 'NIGHT MARKET 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/NIGHT%20MARKET%202.webp' },
            { name: 'TREASURE RAIDERS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/TREASURE%20RAIDERS.webp' },
            { name: 'SUPER ELEMENTS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/SUPER%20ELEMENTS.webp' },
            { name: 'FORTUNE MONEY BOOM', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FORTUNE%20MONEY%20BOOM.webp' },
            { name: 'COWBOYS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/COWBOYS.webp' },
            { name: 'ZEUS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/ZEUS.webp' },
            { name: 'EGYPT BONANZA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/EGYPT%20BONANZA.webp' },
            { name: 'LEGEND OF INCA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/LEGEND%20OF%20INCA.webp' },
            { name: 'THE GOLDEN PANTHER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/THE%20GOLDEN%20PANTHER.webp' },
            { name: 'FORTUNE SHEEP', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FORTUNE%20SHEEP.webp' },
            { name: 'RICH MAN', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/RICH%20MAN.webp' },
            { name: 'GRAND BLUE', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/GRAND%20BLUE.webp' },
            { name: 'MONEY TREE DOZER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/MONEY%20TREE%20DOZER.webp' },
            { name: 'CHILIHUAHUA', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CHILIHUAHUA.webp' },
            { name: 'CRAZY BUFFALO', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CRAZY%20BUFFALO.webp' },
            { name: 'WIN WIN NEKO', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/WIN%20WIN%20NEKO.webp' },
            { name: 'ROBIN HOOD', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/ROBIN%20HOOD.webp' },
            { name: 'MERGE MAGIC', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/MERGE%20MAGIC.webp' },
            { name: 'FORTUNE KOI', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FORTUNE%20KOI.webp' },
            { name: 'TREASURE CRUISE', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/TREASURE%20CRUISE.webp' },
            { name: 'LUXURY GOLDEN PANTHER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/LUXURY%20GOLDEN%20PANTHER.webp' },
            { name: 'MAGIC BEANS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/MAGIC%20BEANS.webp' },
            { name: 'GOLD RUSH', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/GOLD%20RUSH.webp' },
            { name: 'MINES', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/MINES.webp' },
            { name: 'PONG PONG HU', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/PONG%20PONG%20HU.webp' },
            { name: 'FORTUNE EGG', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FORTUNE%20EGG.webp' },
            { name: 'LIGHTNING BOMB', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/LIGHTNING%20BOMB.webp' },
            { name: 'THREE LITTLE PIGS', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/THREE%20LITTLE%20PIGS.webp' },
            { name: 'SUPER COLOR GAME', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/SUPER%20COLOR%20GAME.webp' },
            { name: 'GOGO RISE', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/GOGO%20RISE.webp' },
            { name: 'GLORY OF ROME', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/GLORY%20OF%20ROME.webp' },
            { name: 'ANIMAL RACING', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/ANIMAL%20RACING.webp' },
            { name: 'HOT POT PARTY', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/HOT%20POT%20PARTY.webp' },
            { name: 'CIRCUS DOZER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/CIRCUS%20DOZER.webp' },
            { name: 'WAR OF THE UNIVERSE', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/WAR%20OF%20THE%20UNIVERSE.webp' },
            { name: 'PANDA DRAGON BOAT', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/PANDA%20DRAGON%20BOAT.webp' },
            { name: 'DA LE MEN', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/DA%20LE%20MEN.webp' },
            { name: 'HAPPY DUO BAO', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/HAPPY%20DUO%20BAO.webp' },
            { name: 'FA CHAI DOZER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/FA%20CHAI%20DOZER.webp' },
            { name: 'TOWER', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/TOWER.webp' },
            { name: '\\u62f3\\u62f3\\u81f4\\u5bcc', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u62f3\u62f3\u81f4\u5bcc.webp' },
            { name: '\\u81f3\\u5c0a\\u738b\\u724c', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u81f3\u5c0a\u738b\u724c.webp' },
            { name: '\\u5927\\u8fc7\\u5e74\\u8def\\u8def\\u53d1', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5927\u8fc7\u5e74\u8def\u8def\u53d1.webp' },
            { name: '\\u5e1d\\u56fd\\u7ade\\u6280\\u573a', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5e1d\u56fd\u7ade\u6280\u573a.webp' },
            { name: '\\u5420\\u9640\\u5973\\u795e', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5420\u9640\u5973\u795e.webp' },
            { name: '\\u5370\\u52a0\\u5973\\u7687', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5370\u52a0\u5973\u7687.webp' },
            { name: '\\u871c\\u7cd6\\u7206\\u51fb', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u871c\u7cd6\u7206\u51fb.webp' },
            { name: '\\u901b\\u591c\\u5e02', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u901b\u591c\u5e02.webp' },
            { name: '\\u5927\\u8fc7\\u5e74', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5927\u8fc7\u5e74.webp' },
            { name: '\\u5927\\u8fc7\\u5e742', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5927\u8fc7\u5e742.webp' },
            { name: '\\u8d22\\u5bcc\\u8fde\\u8fde', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u8d22\u5bcc\u8fde\u8fde.webp' },
            { name: '\\u795e\\u706f\\u91d1\\u7075', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u795e\u706f\u91d1\u7075.webp' },
            { name: '\\u8d22\\u5bcc\\u8fde\\u8fde 3x3', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u8d22\u5bcc\u8fde\u8fde%203x3.webp' },
            { name: '\\u901b\\u591c\\u5e022', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u901b\u591c\u5e022.webp' },
            { name: '\\u53e4\\u5893\\u79d8\\u5b9d', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u53e4\u5893\u79d8\u5b9d.webp' },
            { name: '\\u5143\\u7d20\\u72c2\\u6f6e', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5143\u7d20\u72c2\u6f6e.webp' },
            { name: '\\u62db\\u8d22\\u9f99\\u70ae', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u62db\u8d22\u9f99\u70ae.webp' },
            { name: '\\u897f\\u90e8\\u98ce\\u4e91', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u897f\u90e8\u98ce\u4e91.webp' },
            { name: '\\u5b99\\u65af', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5b99\u65af.webp' },
            { name: '\\u57c3\\u53ca\\u79d8\\u5b9d', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u57c3\u53ca\u79d8\u5b9d.webp' },
            { name: '\\u5370\\u52a0\\u4f20\\u5947', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5370\u52a0\u4f20\u5947.webp' },
            { name: '\\u91d1\\u94b1\\u8c79', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u91d1\u94b1\u8c79.webp' },
            { name: '\\u795e\\u8d22\\u98de\\u7f8a', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u795e\u8d22\u98de\u7f8a.webp' },
            { name: '\\u5bcc\\u8d35\\u5927\\u4ea8', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5bcc\u8d35\u5927\u4ea8.webp' },
            { name: '\\u5de8\\u6d77\\u89c5\\u5b9d', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u5de8\u6d77\u89c5\u5b9d.webp' },
            { name: '\\u94b1\\u6811\\u63a8\\u5e01\\u673a', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u94b1\u6811\u63a8\u5e01\u673a.webp' },
            { name: '\\u9739\\u96f3\\u6912\\u5a03', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/FC/\u9739\u96f3\u6912\u5a03.webp' },
        ]
    },
    habanero: {
        name: 'HABANERO',
        code: 'HB',
        logo: CDN_PROVIDER + 'HB.png',
        games: [
            { name: 'Taberna De Los Muertos Ultra', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Taberna%20De%20Los%20Muertos%20Ultra.webp' },
            { name: 'Hey Sushi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Hey%20Sushi.webp' },
            { name: 'Christmas Gift Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Christmas%20Gift%20Rush.webp' },
            { name: 'Nine Tails', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Nine%20Tails.webp' },
            { name: 'Lantern Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Lantern%20Luck.webp' },
            { name: 'Fa Cai Shen Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Fa%20Cai%20Shen%20Deluxe.webp' },
            { name: 'Fly!', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Fly!.webp' },
            { name: 'New Years Bash', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/New%20Years%20Bash.webp' },
            { name: 'Wealth Inn', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Wealth%20Inn.webp' },
            { name: 'Taberna De Los Muertos', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Taberna%20De%20Los%20Muertos.webp' },
            { name: 'Return To The Feature', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Return%20To%20The%20Feature.webp' },
            { name: 'Bomb Runner', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Bomb%20Runner.webp' },
            { name: 'Loony Blox', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Loony%20Blox.webp' },
            { name: 'Marvelous Furlongs', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Marvelous%20Furlongs.webp' },
            { name: 'Lucky Durian', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Lucky%20Durian.webp' },
            { name: 'Knockout Football Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Knockout%20Football%20Rush.webp' },
            { name: 'Calaveras Explosivas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Calaveras%20Explosivas.webp' },
            { name: 'Candy Tower', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Candy%20Tower.webp' },
            { name: 'Golden Unicorn Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Golden%20Unicorn%20Deluxe.webp' },
            { name: 'Taiko Beats', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Taiko%20Beats.webp' },
            { name: 'Space Goonz', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Space%20Goonz.webp' },
            { name: 'Presto!', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Presto!.webp' },
            { name: 'Happy Ape', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Happy%20Ape.webp' },
            { name: 'Disco Beats', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Disco%20Beats.webp' },
            { name: 'Koi Gate', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Koi%20Gate.webp' },
            { name: 'Mummy Money', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Mummy%20Money.webp' },
            { name: 'Jellyfish Flow', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Jellyfish%20Flow.webp' },
            { name: 'Scopa', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Scopa.webp' },
            { name: 'Dragon Castle', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Dragon%20Castle.webp' },
            { name: 'Roman Empire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Roman%20Empire.webp' },
            { name: 'Orbs Of Atlantis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Orbs%20Of%20Atlantis.webp' },
            { name: '5 Lucky Lions', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/5%20Lucky%20Lions.webp' },
            { name: 'Ruffled Up', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Ruffled%20Up.webp' },
            { name: 'Mount Mazuma', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Mount%20Mazuma.webp' },
            { name: 'Fa Cai Shen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Fa%20Cai%20Shen.webp' },
            { name: 'Colossal Gems', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Colossal%20Gems.webp' },
            { name: 'Hot Hot Halloween', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Hot%20Hot%20Halloween.webp' },
            { name: 'Lucky Fortune Cat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Lucky%20Fortune%20Cat.webp' },
            { name: 'All For One', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/All%20For%20One.webp' },
            { name: 'Magic Oak', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Magic%20Oak.webp' },
            { name: 'Mr Bling', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Mr%20Bling.webp' },
            { name: 'Laughing Buddha', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Laughing%20Buddha.webp' },
            { name: 'Aztlan\\u2019s Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Aztlan\u2019s%20Gold.webp' },
            { name: 'Gangsters', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Gangsters.webp' },
            { name: 'Treasure Diver', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Treasure%20Diver.webp' },
            { name: 'Rolling Roger', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Rolling%20Roger.webp' },
            { name: 'Totem Towers', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Totem%20Towers.webp' },
            { name: 'Panda Panda', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Panda%20Panda.webp' },
            { name: 'Sir Blingalot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Sir%20Blingalot.webp' },
            { name: 'Santa\\u2019s Village', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Santa\u2019s%20Village.webp' },
            { name: 'Egyptian Dreams Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Egyptian%20Dreams%20Deluxe.webp' },
            { name: 'Kane\\u2019s Inferno', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Kane\u2019s%20Inferno.webp' },
            { name: 'Tuk Tuk Thailand', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Tuk%20Tuk%20Thailand.webp' },
            { name: 'Coyote Crash', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Coyote%20Crash.webp' },
            { name: 'Fenghuang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Fenghuang.webp' },
            { name: 'Super Twister', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Super%20Twister.webp' },
            { name: 'Dragon\\\'s Throne', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Dragon\%27s%20Throne.webp' },
            { name: 'Cashosaurus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Cashosaurus.webp' },
            { name: 'Pirate\\\'s Plunder', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Pirate\%27s%20Plunder.webp' },
            { name: 'Queen of Queens', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Queen%20of%20Queens.webp' },
            { name: 'Ride \\\'em Cowboy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Ride%20\%27em%20Cowboy.webp' },
            { name: 'Shaolin Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Shaolin%20Fortunes.webp' },
            { name: 'Shogun\\u2019s Land', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Shogun\u2019s%20Land.webp' },
            { name: 'Viking\\u2019s Plunder', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Viking\u2019s%20Plunder.webp' },
            { name: 'London Hunter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/London%20Hunter.webp' },
            { name: 'Barnstormer Bucks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Barnstormer%20Bucks.webp' },
            { name: 'Blackbeard\\u2019s Bounty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Blackbeard\u2019s%20Bounty.webp' },
            { name: 'Gold Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Gold%20Rush.webp' },
            { name: 'Wild Trucks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Wild%20Trucks.webp' },
            { name: 'Frontier Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Frontier%20Fortunes.webp' },
            { name: 'Space Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Space%20Fortune.webp' },
            { name: 'Monster Mash Cash', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Monster%20Mash%20Cash.webp' },
            { name: 'Zeus 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Zeus%202.webp' },
            { name: '5 Mariachis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/5%20Mariachis.webp' },
            { name: 'Jugglenaut', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Jugglenaut.webp' },
            { name: 'The Big Deal', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/The%20Big%20Deal.webp' },
            { name: 'Cake Valley', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Cake%20Valley.webp' },
            { name: 'Rodeo Drive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Rodeo%20Drive.webp' },
            { name: 'Happiest Christmas Tree', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Happiest%20Christmas%20Tree.webp' },
            { name: 'Disco Funk', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/HB/Disco%20Funk.webp' },
        ]
    },
    cq9: {
        name: 'CQ9',
        code: 'CQ9',
        logo: CDN_PROVIDER + 'CQ9.png',
        games: [
            { name: 'Disconight', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Disconight.webp' },
            { name: 'Monkey King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Monkey%20King.webp' },
            { name: 'Love Story', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Love%20Story.webp' },
            { name: 'Rabbit Rampage', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Rabbit%20Rampage.webp' },
            { name: 'Le Cirque', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Le%20Cirque.webp' },
            { name: 'Eternal Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Eternal%20Fortune.webp' },
            { name: 'Lotus Lantern', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Lotus%20Lantern.webp' },
            { name: 'Beanstalk', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Beanstalk.webp' },
            { name: 'Loy Krathong', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Loy%20Krathong.webp' },
            { name: 'Acrobatics', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Acrobatics.webp' },
            { name: 'Lonely Planet', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Lonely%20Planet.webp' },
            { name: 'Lucky 3', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Lucky%203.webp' },
            { name: 'Myeong-ryang', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Myeong-ryang.webp' },
            { name: 'Meow', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Meow.webp' },
            { name: 'God Of Chess', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/God%20Of%20Chess.webp' },
            { name: 'Paradise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Paradise.webp' },
            { name: 'Oneshot Fishing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Oneshot%20Fishing.webp' },
            { name: 'LuckyFishing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/LuckyFishing.webp' },
            { name: 'Banker Dice Bull-Bull', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Banker%20Dice%20Bull-Bull.webp' },
            { name: 'Peeking Banker Bull-Bull', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Peeking%20Banker%20Bull-Bull.webp' },
            { name: 'Yaxing Live', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Yaxing%20Live.webp' },
            { name: 'Happy Insect', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Happy%20Insect.webp' },
            { name: 'Mahjong For 2 Players', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Mahjong%20For%202%20Players.webp' },
            { name: 'Landlord Fights Carnival', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Landlord%20Fights%20Carnival.webp' },
            { name: 'Fruit King', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fruit%20King.webp' },
            { name: 'Lucky Bats', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Lucky%20Bats.webp' },
            { name: 'Luckybatsjp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Luckybatsjp.webp' },
            { name: 'Fruity Carnival', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fruity%20Carnival.webp' },
            { name: 'Jewel Luxury', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Jewel%20Luxury.webp' },
            { name: 'Chicky Parm Parm', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Chicky%20Parm%20Parm.webp' },
            { name: 'Jumping Mobile', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Jumping%20Mobile.webp' },
            { name: 'Goldeneggsjp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Goldeneggsjp.webp' },
            { name: 'Treasurebowljp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Treasurebowljp.webp' },
            { name: 'Jump Higher Mobile', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Jump%20Higher%20Mobile.webp' },
            { name: 'Rave Jump Mobile', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Rave%20Jump%20Mobile.webp' },
            { name: 'Flyout', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Flyout.webp' },
            { name: 'Pyramid Raider', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Pyramid%20Raider.webp' },
            { name: 'Flying Cai Shen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Flying%20Cai%20Shen.webp' },
            { name: 'Snow Queen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Snow%20Queen.webp' },
            { name: 'Wonderland', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Wonderland.webp' },
            { name: '5 God Beasts', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/5%20God%20Beasts.webp' },
            { name: 'Skrskr', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Skrskr.webp' },
            { name: 'Treasure House', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Treasure%20House.webp' },
            { name: 'Alice Run Jp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Alice%20Run%20Jp.webp' },
            { name: 'Rave Jump 2 M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Rave%20Jump%202%20M.webp' },
            { name: 'Zuma Wild', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Zuma%20Wild.webp' },
            { name: 'Lucky Bats M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Lucky%20Bats%20M.webp' },
            { name: 'Invincible Elephant', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Invincible%20Elephant.webp' },
            { name: 'Zeus M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Zeus%20M.webp' },
            { name: 'God Of War M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/God%20Of%20War%20M.webp' },
            { name: 'Wheel Money', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Wheel%20Money.webp' },
            { name: 'Gu Gu Gu 2 M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Gu%20Gu%20Gu%202%20M.webp' },
            { name: 'Sakura Legend', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Sakura%20Legend.webp' },
            { name: 'Gold Stealer', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Gold%20Stealer.webp' },
            { name: 'Fa Cai Shen M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fa%20Cai%20Shen%20M.webp' },
            { name: 'Good Fortune M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Good%20Fortune%20M.webp' },
            { name: 'Gu Gu Gu M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Gu%20Gu%20Gu%20M.webp' },
            { name: 'Running Animals', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Running%20Animals.webp' },
            { name: 'Disconight M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Disconight%20M.webp' },
            { name: 'Move N\\u2019 Jump', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Move%20N\u2019%20Jump.webp' },
            { name: 'Fire Chibi M', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fire%20Chibi%20M.webp' },
            { name: 'Fire Chibi 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fire%20Chibi%202.webp' },
            { name: 'Xmas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Xmas.webp' },
            { name: 'Hephaestus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Hephaestus.webp' },
            { name: 'Fa Cai Fu Wa', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fa%20Cai%20Fu%20Wa.webp' },
            { name: 'Diamond Treasure', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Diamond%20Treasure.webp' },
            { name: 'Sky Lanterns', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Sky%20Lanterns.webp' },
            { name: 'Flower Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Flower%20Fortunes.webp' },
            { name: 'Fortune Totem', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fortune%20Totem.webp' },
            { name: 'Gugugu', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Gugugu.webp' },
            { name: 'Shou-Xin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Shou-Xin.webp' },
            { name: 'Double Fly', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Double%20Fly.webp' },
            { name: 'Six Candy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Six%20Candy.webp' },
            { name: 'Kronos', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Kronos.webp' },
            { name: '5 Boxing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/5%20Boxing.webp' },
            { name: 'Black Wukong', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Black%20Wukong.webp' },
            { name: 'Super5', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Super5.webp' },
            { name: 'Fa Cai Shen2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Fa%20Cai%20Shen2.webp' },
            { name: 'Hercules', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Hercules.webp' },
            { name: 'Ne Zha Advent', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/CQ9/Ne%20Zha%20Advent.webp' },
        ]
    },
    redtiger: {
        name: 'REDTIGER',
        code: 'RT',
        logo: CDN_PROVIDER + 'RT.png',
        games: [
            { name: 'Dragon\\u2019s Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Luck.webp' },
            { name: 'Dragon\\u2019s Luck Power Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Luck%20Power%20Reels.webp' },
            { name: 'Fortune House', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Fortune%20House.webp' },
            { name: 'Dragon\\u2019s Fire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Fire.webp' },
            { name: 'Magic Gate', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Magic%20Gate.webp' },
            { name: 'Lucky Fortune Cat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Lucky%20Fortune%20Cat.webp' },
            { name: 'Pirates\\u2019 Plenty Battle for Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Pirates\u2019%20Plenty%20Battle%20for%20Gold.webp' },
            { name: '10,001 Nights', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/10,001%20Nights.webp' },
            { name: 'Epic Journey', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Epic%20Journey.webp' },
            { name: 'Phoenix Fire Power Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Phoenix%20Fire%20Power%20Reels.webp' },
            { name: 'Chinese Treasures', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Chinese%20Treasures.webp' },
            { name: 'Pirates\\u2019 Plenty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Pirates\u2019%20Plenty.webp' },
            { name: 'Golden Offer', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Golden%20Offer.webp' },
            { name: 'RA\\u2019s Legend', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/RA\u2019s%20Legend.webp' },
            { name: 'Gonzo\\u2019s Quest Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Gonzo\u2019s%20Quest%20Megaways.webp' },
            { name: 'Rainbow Jackpots', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Rainbow%20Jackpots.webp' },
            { name: 'Mega Pyramid', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Mega%20Pyramid.webp' },
            { name: 'God of Wealth', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/God%20of%20Wealth.webp' },
            { name: '777 Strike', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/777%20Strike.webp' },
            { name: 'Ancients Blessing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Ancients%20Blessing.webp' },
            { name: 'Aurum Codex', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Aurum%20Codex.webp' },
            { name: 'Betty, Boris and Boo', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Betty,%20Boris%20and%20Boo.webp' },
            { name: 'Bounty Raid', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Bounty%20Raid.webp' },
            { name: 'Cash Ultimate', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Cash%20Ultimate.webp' },
            { name: 'Cash volt', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Cash%20volt.webp' },
            { name: 'Diamond Blitz', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Diamond%20Blitz.webp' },
            { name: 'Dragon\\u2019s Fire Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Fire%20Megaways.webp' },
            { name: 'Dynamite Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dynamite%20Riches.webp' },
            { name: 'Five Star', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Five%20Star.webp' },
            { name: 'Jack in a Pot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Jack%20in%20a%20Pot.webp' },
            { name: 'Jingle Bells', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Jingle%20Bells.webp' },
            { name: 'Mystery Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Mystery%20Reels.webp' },
            { name: 'Piggy Riches Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Piggy%20Riches%20Megaways.webp' },
            { name: 'Rainbow Jackpots Power Lines', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Rainbow%20Jackpots%20Power%20Lines.webp' },
            { name: 'Reel Keeper', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Reel%20Keeper.webp' },
            { name: 'Reel King Mega', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Reel%20King%20Mega.webp' },
            { name: 'Regal Beasts', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Regal%20Beasts.webp' },
            { name: 'Regal Streak', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Regal%20Streak.webp' },
            { name: 'Thor\\u2019s vengeance', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Thor\u2019s%20vengeance.webp' },
            { name: 'Treasure Mine', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Treasure%20Mine.webp' },
            { name: 'Trillionaire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Trillionaire.webp' },
            { name: 'War Of Gods', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/War%20Of%20Gods.webp' },
            { name: 'Wings of Ra', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Wings%20of%20Ra.webp' },
            { name: 'Zeus Lightning Power Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Zeus%20Lightning%20Power%20Reels.webp' },
            { name: '24 Hour Grand Prix', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/24%20Hour%20Grand%20Prix.webp' },
            { name: '4Squad', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/4Squad.webp' },
            { name: '5 Families', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/5%20Families.webp' },
            { name: 'Agent Royale', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Agent%20Royale.webp' },
            { name: 'Ancient Script', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Ancient%20Script.webp' },
            { name: 'Arcade Bomb', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Arcade%20Bomb.webp' },
            { name: 'Atlantis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Atlantis.webp' },
            { name: 'Aztec Spins', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Aztec%20Spins.webp' },
            { name: 'Blue Diamond', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Blue%20Diamond.webp' },
            { name: 'Bombuster', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Bombuster.webp' },
            { name: 'Cinderella\\u2019s Ball', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Cinderella\u2019s%20Ball.webp' },
            { name: 'Cirque de la Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Cirque%20de%20la%20Fortune.webp' },
            { name: 'Clash of the Beasts', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Clash%20of%20the%20Beasts.webp' },
            { name: 'Crazy Genie', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Crazy%20Genie.webp' },
            { name: 'Crystal Mirror', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Crystal%20Mirror.webp' },
            { name: 'Devil\\u2019s Number', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Devil\u2019s%20Number.webp' },
            { name: 'Dice Dice Dice', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dice%20Dice%20Dice.webp' },
            { name: 'Divine Ways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Divine%20Ways.webp' },
            { name: 'Dragon\\u2019s Fire Infinireels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Fire%20Infinireels.webp' },
            { name: 'Dragon\\u2019s Luck Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Dragon\u2019s%20Luck%20Megaways.webp' },
            { name: 'Eagle Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Eagle%20Riches.webp' },
            { name: 'Elven Magic', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Elven%20Magic.webp' },
            { name: 'Emerald Diamond', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Emerald%20Diamond.webp' },
            { name: 'Esqueleto Mariachi', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Esqueleto%20Mariachi.webp' },
            { name: 'Five Star Power Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Five%20Star%20Power%20Reels.webp' },
            { name: 'Flaming Fox', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Flaming%20Fox.webp' },
            { name: 'Fortune Charm', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Fortune%20Charm.webp' },
            { name: 'Fortune Fest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Fortune%20Fest.webp' },
            { name: 'Fruit Blox', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Fruit%20Blox.webp' },
            { name: 'Fruit Snap', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Fruit%20Snap.webp' },
            { name: 'Gems Gone Wild', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Gems%20Gone%20Wild.webp' },
            { name: 'Gems Gone Wild Power Reels', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Gems%20Gone%20Wild%20Power%20Reels.webp' },
            { name: 'Gemtastic', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Gemtastic.webp' },
            { name: 'Gold Star', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Gold%20Star.webp' },
            { name: 'Golden Cryptex', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Golden%20Cryptex.webp' },
            { name: 'Golden Leprechaun Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/RT/Golden%20Leprechaun%20Megaways.webp' },
        ]
    },
    netent: {
        name: 'NETENT',
        code: 'NT',
        logo: CDN_PROVIDER + 'NT.png',
        games: [
            { name: 'Blood Suckers', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Blood%20Suckers.webp' },
            { name: 'Dazzle Me Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dazzle%20Me%20Megaways.webp' },
            { name: 'Dead or Alive 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dead%20or%20Alive%202.webp' },
            { name: 'Divine Fortune Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Divine%20Fortune%20Megaways.webp' },
            { name: 'Gonzo\\u2019s Quest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Gonzo\u2019s%20Quest.webp' },
            { name: 'Finn and the Swirly Spin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Finn%20and%20the%20Swirly%20Spin.webp' },
            { name: 'Fruit Shop', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fruit%20Shop.webp' },
            { name: 'Guns N\\u2019 Roses video Slots', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Guns%20N\u2019%20Roses%20video%20Slots.webp' },
            { name: 'Jack Hammer 2: Fishy Business', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jack%20Hammer%202:%20Fishy%20Business.webp' },
            { name: 'Jimi Hendrix Online Slot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jimi%20Hendrix%20Online%20Slot.webp' },
            { name: 'Jumanji', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jumanji.webp' },
            { name: 'Motorhead video Slot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Motorhead%20video%20Slot.webp' },
            { name: 'Narcos', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Narcos.webp' },
            { name: 'Ozzy Osbourne video Slots', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Ozzy%20Osbourne%20video%20Slots.webp' },
            { name: 'Pyramid: Quest for Immortality', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Pyramid:%20Quest%20for%20Immortality.webp' },
            { name: 'Reel Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Reel%20Rush.webp' },
            { name: 'Starburst', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Starburst.webp' },
            { name: 'Street Fighter II: The World Warrior Slot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Street%20Fighter%20II:%20The%20World%20Warrior%20Slot.webp' },
            { name: 'Turn Your Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Turn%20Your%20Fortune.webp' },
            { name: 'Twin Spin Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Twin%20Spin%20Megaways.webp' },
            { name: 'Twin Spin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Twin%20Spin.webp' },
            { name: 'Wild Wild West: The Great Train Heist', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Wild%20Wild%20West:%20The%20Great%20Train%20Heist.webp' },
            { name: 'Steam Tower', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Steam%20Tower.webp' },
            { name: 'Piggy Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Piggy%20Riches.webp' },
            { name: 'Jingle Spin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jingle%20Spin.webp' },
            { name: 'Jack and the Beanstalk', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jack%20and%20the%20Beanstalk.webp' },
            { name: 'Gordon Ramsay Hell\\u2019s Kitchen', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Gordon%20Ramsay%20Hell\u2019s%20Kitchen.webp' },
            { name: 'Fruit Shop Megaways', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fruit%20Shop%20Megaways.webp' },
            { name: 'Dead or Alive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dead%20or%20Alive.webp' },
            { name: 'Aloha! Cluster Pays', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Aloha!%20Cluster%20Pays.webp' },
            { name: 'Aloha! Christmas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Aloha!%20Christmas.webp' },
            { name: 'American Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/American%20Roulette.webp' },
            { name: 'Asgardian Stones', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Asgardian%20Stones.webp' },
            { name: 'Baccarat', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Baccarat.webp' },
            { name: 'Blackjack', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Blackjack.webp' },
            { name: 'Blood Suckers II', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Blood%20Suckers%20II.webp' },
            { name: 'Butterfly Staxx', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Butterfly%20Staxx.webp' },
            { name: 'Butterfly Staxx 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Butterfly%20Staxx%202.webp' },
            { name: 'Codex of Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Codex%20of%20Fortune.webp' },
            { name: 'Dark King: Forbidden Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dark%20King:%20Forbidden%20Riches.webp' },
            { name: 'Dazzle Me', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dazzle%20Me.webp' },
            { name: 'Dead or Alive 2 Feature Buy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Dead%20or%20Alive%202%20Feature%20Buy.webp' },
            { name: 'Double Stacks', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Double%20Stacks.webp' },
            { name: 'Drive: Multiplier Mayhem', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Drive:%20Multiplier%20Mayhem.webp' },
            { name: 'Elements: The Awakening', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Elements:%20The%20Awakening.webp' },
            { name: 'European Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/European%20Roulette.webp' },
            { name: 'Fairytale Legends: Red Riding Hood', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fairytale%20Legends:%20Red%20Riding%20Hood.webp' },
            { name: 'Finn\\u2019s Golden Tavern', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Finn\u2019s%20Golden%20Tavern.webp' },
            { name: 'Flowers', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Flowers.webp' },
            { name: 'French Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/French%20Roulette.webp' },
            { name: 'Fruit Shop Christmas Edition', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fruit%20Shop%20Christmas%20Edition.webp' },
            { name: 'Fruit Spin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fruit%20Spin.webp' },
            { name: 'Gorilla Kingdom', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Gorilla%20Kingdom.webp' },
            { name: 'Hotline', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Hotline.webp' },
            { name: 'Hotline 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Hotline%202.webp' },
            { name: 'Irish Pot Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Irish%20Pot%20Luck.webp' },
            { name: 'Jack Hammer', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jack%20Hammer.webp' },
            { name: 'Jungle Spirit: Call of the Wild', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Jungle%20Spirit:%20Call%20of%20the%20Wild.webp' },
            { name: 'Koi Princess', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Koi%20Princess.webp' },
            { name: 'Lost Relics', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Lost%20Relics.webp' },
            { name: 'Parthenon: Quest for Immortality', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Parthenon:%20Quest%20for%20Immortality.webp' },
            { name: 'Rage of the Seas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Rage%20of%20the%20Seas.webp' },
            { name: 'Riches of Midgard: Land and Expand', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Riches%20of%20Midgard:%20Land%20and%20Expand.webp' },
            { name: 'Rome: The Golden Age', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Rome:%20The%20Golden%20Age.webp' },
            { name: 'Scruffy Duck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Scruffy%20Duck.webp' },
            { name: 'Secret of the Stones', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Secret%20of%20the%20Stones.webp' },
            { name: 'Secrets of Atlantis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Secrets%20of%20Atlantis.webp' },
            { name: 'Secrets of Christmas', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Secrets%20of%20Christmas.webp' },
            { name: 'Serengeti Kings', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Serengeti%20Kings.webp' },
            { name: 'Space Wars', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Space%20Wars.webp' },
            { name: 'Starburst XXXtreme', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Starburst%20XXXtreme.webp' },
            { name: 'The Invisible Man', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/The%20Invisible%20Man.webp' },
            { name: 'Victorious', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Victorious.webp' },
            { name: 'Vikings Video Slot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Vikings%20Video%20Slot.webp' },
            { name: 'Warlords: Crystals of Power', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Warlords:%20Crystals%20of%20Power.webp' },
            { name: 'Wild Water', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Wild%20Water.webp' },
            { name: 'Wild Worlds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Wild%20Worlds.webp' },
            { name: 'Willy\\u2019s Hot Chillies', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Willy\u2019s%20Hot%20Chillies.webp' },
            { name: 'Reef Raider', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Reef%20Raider.webp' },
            { name: 'Fruit Blaze', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/NT/Fruit%20Blaze.webp' },
        ]
    },
    microgaming: {
        name: 'MICROGAMING',
        code: 'MGP',
        logo: CDN_PROVIDER + 'MGP.png',
        games: [
            { name: 'Forgotten Island Megaways \\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Forgotten%20Island%20Megaways%20\u2122.webp' },
            { name: '777 Mega Deluxe\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/777%20Mega%20Deluxe\u2122.webp' },
            { name: 'Golden Stallion\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Golden%20Stallion\u2122.webp' },
            { name: 'Chicago Gold\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Chicago%20Gold\u2122.webp' },
            { name: 'Carnaval Jackpot', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Carnaval%20Jackpot.webp' },
            { name: 'Adventures Of Doubloon Island\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Adventures%20Of%20Doubloon%20Island\u2122.webp' },
            { name: 'Flower Fortunes Megaways\\u2122', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Flower%20Fortunes%20Megaways\u2122.webp' },
            { name: '108 Heroes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/108%20Heroes.webp' },
            { name: '108 Heroes Multiplier Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/108%20Heroes%20Multiplier%20Fortunes.webp' },
            { name: '5 Reel Drive', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/5%20Reel%20Drive.webp' },
            { name: '777 Royal Wheel', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/777%20Royal%20Wheel.webp' },
            { name: '9 Masks Of Fire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/9%20Masks%20Of%20Fire.webp' },
            { name: '9 Pots Of Gold', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/9%20Pots%20Of%20Gold.webp' },
            { name: 'A Dark Matter', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/A%20Dark%20Matter.webp' },
            { name: 'A Tale Of Elves', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/A%20Tale%20Of%20Elves.webp' },
            { name: 'Actionops: Snow And Sable', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Actionops:%20Snow%20And%20Sable.webp' },
            { name: 'Adventure Palace', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Adventure%20Palace.webp' },
            { name: 'Age Of Conquest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Age%20Of%20Conquest.webp' },
            { name: 'Age Of Discovery', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Age%20Of%20Discovery.webp' },
            { name: 'Agent Jane Blonde', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Agent%20Jane%20Blonde.webp' },
            { name: 'Agent Jane Blonde Returns', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Agent%20Jane%20Blonde%20Returns.webp' },
            { name: 'Alaskan Fishing', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Alaskan%20Fishing.webp' },
            { name: 'Alchemist Stone', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Alchemist%20Stone.webp' },
            { name: 'Alchemy Blast', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Alchemy%20Blast.webp' },
            { name: 'Alchemy Fortunes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Alchemy%20Fortunes.webp' },
            { name: 'Ancient Fortunes: Zeus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Ancient%20Fortunes:%20Zeus.webp' },
            { name: 'Ariana', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Ariana.webp' },
            { name: 'Asian Beauty', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Asian%20Beauty.webp' },
            { name: 'Assassin Moon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Assassin%20Moon.webp' },
            { name: 'Astro Legends: Lyra And Erion', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Astro%20Legends:%20Lyra%20And%20Erion.webp' },
            { name: 'Augustus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Augustus.webp' },
            { name: 'Aurora Wilds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Aurora%20Wilds.webp' },
            { name: 'Avalon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Avalon.webp' },
            { name: 'Badminton Hero', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Badminton%20Hero.webp' },
            { name: 'Banana Odyssey', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Banana%20Odyssey.webp' },
            { name: 'Bar Bar Black Sheep - 5 Reel', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bar%20Bar%20Black%20Sheep%20-%205%20Reel.webp' },
            { name: 'Bars & Stripes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bars%20&%20Stripes.webp' },
            { name: 'Basketball Star', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Basketball%20Star.webp' },
            { name: 'Basketball Star Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Basketball%20Star%20Deluxe.webp' },
            { name: 'Basketball Star On Fire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Basketball%20Star%20On%20Fire.webp' },
            { name: 'Battle Royale', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Battle%20Royale.webp' },
            { name: 'Beach Babes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Beach%20Babes.webp' },
            { name: 'Beautiful Bones', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Beautiful%20Bones.webp' },
            { name: 'Big Kahuna', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Big%20Kahuna.webp' },
            { name: 'Big Top', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Big%20Top.webp' },
            { name: 'Bikini Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bikini%20Party.webp' },
            { name: 'Boat Of Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Boat%20Of%20Fortune.webp' },
            { name: 'Boogie Monsters', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Boogie%20Monsters.webp' },
            { name: 'Book Of Oz', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Book%20Of%20Oz.webp' },
            { name: 'Book Of Oz - Lock \\u2019N Spin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Book%20Of%20Oz%20-%20Lock%20\u2019N%20Spin.webp' },
            { name: 'Bookie Of Odds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bookie%20Of%20Odds.webp' },
            { name: 'Boom Pirates', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Boom%20Pirates.webp' },
            { name: 'Break Away', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Away.webp' },
            { name: 'Break Away Deluxe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Away%20Deluxe.webp' },
            { name: 'Break Away Lucky Wilds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Away%20Lucky%20Wilds.webp' },
            { name: 'Break Away Ultra', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Away%20Ultra.webp' },
            { name: 'Break Da Bank', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Da%20Bank.webp' },
            { name: 'Break Da Bank Again', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Da%20Bank%20Again.webp' },
            { name: 'Break Da Bank Again Respin', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Break%20Da%20Bank%20Again%20Respin.webp' },
            { name: 'Bush Telegraph', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bush%20Telegraph.webp' },
            { name: 'Bust The Bank', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Bust%20The%20Bank.webp' },
            { name: 'Candy Dreams', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Candy%20Dreams.webp' },
            { name: 'Carnaval', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Carnaval.webp' },
            { name: 'Cash Crazy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cash%20Crazy.webp' },
            { name: 'Cash Of Kingdoms', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cash%20Of%20Kingdoms.webp' },
            { name: 'Cashapillar', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cashapillar.webp' },
            { name: 'Cashoccino', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cashoccino.webp' },
            { name: 'Cashville', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cashville.webp' },
            { name: 'Centre Court', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Centre%20Court.webp' },
            { name: 'Classic 243', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Classic%20243.webp' },
            { name: 'Cool Buck - 5 Reel', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cool%20Buck%20-%205%20Reel.webp' },
            { name: 'Cool Wolf', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cool%20Wolf.webp' },
            { name: 'Couch Potato', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Couch%20Potato.webp' },
            { name: 'Crazy Chameleons', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Crazy%20Chameleons.webp' },
            { name: 'Cricket Star', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Cricket%20Star.webp' },
            { name: 'Deadmau5', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Deadmau5.webp' },
            { name: 'Deck The Halls', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Deck%20The%20Halls.webp' },
            { name: 'Deco Diamonds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Deco%20Diamonds.webp' },
            { name: 'Diamond Empire', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Diamond%20Empire.webp' },
            { name: 'Diamond King Jackpots', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/MGP/Diamond%20King%20Jackpots.webp' },
        ]
    },
    live22: {
        name: 'LIVE22',
        code: 'LIVE22',
        logo: CDN_PROVIDER + 'LIVE22.png',
        games: [
            { name: 'Divine Palace', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Divine%20Palace.webp' },
            { name: 'Vegas Royale', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Vegas%20Royale.webp' },
            { name: 'Golden Coyote', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Golden%20Coyote.webp' },
            { name: 'Aye Aye Captain!', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Aye%20Aye%20Captain!.webp' },
            { name: 'Thriving Wilds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Thriving%20Wilds.webp' },
            { name: 'Roulette', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Roulette.webp' },
            { name: 'Hot Kick', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Hot%20Kick.webp' },
            { name: 'Fishing Master', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Fishing%20Master.webp' },
            { name: 'Roaring Stripes', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Roaring%20Stripes.webp' },
            { name: 'Diego Z', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Diego%20Z.webp' },
            { name: 'Sexy Beach Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Sexy%20Beach%20Party.webp' },
            { name: 'Bloody Seduction', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Bloody%20Seduction.webp' },
            { name: 'Dreams of American', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Dreams%20of%20American.webp' },
            { name: 'Midnight Carnival', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Midnight%20Carnival.webp' },
            { name: 'Gorilla \\\'s Tribe', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Gorilla%20\%27s%20Tribe.webp' },
            { name: 'Bruce the Legend', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Bruce%20the%20Legend.webp' },
            { name: 'Outlawed Gunslinger', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Outlawed%20Gunslinger.webp' },
            { name: 'Clover\\\'s Tales', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Clover\%27s%20Tales.webp' },
            { name: 'Samurai Sensei', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Samurai%20Sensei.webp' },
            { name: 'Dr Eerie\\\'s Experiment', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Dr%20Eerie\%27s%20Experiment.webp' },
            { name: 'Age of Golden Ape', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Age%20of%20Golden%20Ape.webp' },
            { name: 'The Majestic Taj', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/The%20Majestic%20Taj.webp' },
            { name: 'Little Fantail', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Little%20Fantail.webp' },
            { name: 'Spirit Bear', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Spirit%20Bear.webp' },
            { name: 'The Mythical Unicorn', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/The%20Mythical%20Unicorn.webp' },
            { name: '3x Dragon Supreme', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/3x%20Dragon%20Supreme.webp' },
            { name: 'Southern Fortune Lion', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Southern%20Fortune%20Lion.webp' },
            { name: 'Treasures In Varna', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Treasures%20In%20Varna.webp' },
            { name: 'Evil King OX', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Evil%20King%20OX.webp' },
            { name: 'Tank Attack', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Tank%20Attack.webp' },
            { name: 'Fairy Moon Goddess', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Fairy%20Moon%20Goddess.webp' },
            { name: 'Gummy Wonderland', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Gummy%20Wonderland.webp' },
            { name: 'Gods Gambit: Zeus', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Gods%20Gambit:%20Zeus.webp' },
            { name: 'Shipwrecked Riches', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Shipwrecked%20Riches.webp' },
            { name: 'Goal Rush', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Goal%20Rush.webp' },
            { name: 'Gods Gambit: Hades', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Gods%20Gambit:%20Hades.webp' },
            { name: 'Kingdom of Luck', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Kingdom%20of%20Luck.webp' },
            { name: 'Advent of the Dragon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Advent%20of%20the%20Dragon.webp' },
            { name: 'Santa\\\'s Payday', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Santa\%27s%20Payday.webp' },
            { name: 'Bloodmoon Amazonia', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Bloodmoon%20Amazonia.webp' },
            { name: 'Sanctum Of Savanah', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Sanctum%20Of%20Savanah.webp' },
            { name: 'Block Buster', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Block%20Buster.webp' },
            { name: 'Jarvis', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Jarvis.webp' },
            { name: 'Dashing Inferno', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Dashing%20Inferno.webp' },
            { name: 'Wealthy Paradise', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Wealthy%20Paradise.webp' },
            { name: 'Slash fruit', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Slash%20fruit.webp' },
            { name: 'Ocean King 4', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Ocean%20King%204.webp' },
            { name: 'God Defense', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/God%20Defense.webp' },
            { name: 'Wu Kong 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Wu%20Kong%202.webp' },
            { name: 'Fishing War', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Fishing%20War.webp' },
            { name: 'Dragon Tiger', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Dragon%20Tiger.webp' },
            { name: 'Bull Fight', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Bull%20Fight.webp' },
            { name: 'Crab And Shrimp', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Crab%20And%20Shrimp.webp' },
            { name: 'G.O.T:Iron Throne', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/G.O.T:Iron%20Throne.webp' },
            { name: 'G.O.T Siege War', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/G.O.T%20Siege%20War.webp' },
            { name: 'G.O.T Lannister', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/G.O.T%20Lannister.webp' },
            { name: 'Medusa\\\'s Quest', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Medusa\%27s%20Quest.webp' },
            { name: 'Jewel Twinkles', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Jewel%20Twinkles.webp' },
            { name: 'Santa\\\'s Joy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Santa\%27s%20Joy.webp' },
            { name: 'Great Blue', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Great%20Blue.webp' },
            { name: 'Princess & The Evil Witch', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Princess%20&%20The%20Evil%20Witch.webp' },
            { name: 'Explosive Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Explosive%20Fortune.webp' },
            { name: 'Sparta\\\'s Legacy', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Sparta\%27s%20Legacy.webp' },
            { name: 'Justice Bao', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Justice%20Bao.webp' },
            { name: 'Lucky Fortune', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Lucky%20Fortune.webp' },
            { name: 'Guardians of Flower', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Guardians%20of%20Flower.webp' },
            { name: 'Huga', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Huga.webp' },
            { name: 'The Red Empress', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/The%20Red%20Empress.webp' },
            { name: 'The Third Prince', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/The%20Third%20Prince.webp' },
            { name: 'KingOfSpade', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/KingOfSpade.webp' },
            { name: 'Dragon Ball', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Dragon%20Ball.webp' },
            { name: 'Fire Ballon', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Fire%20Ballon.webp' },
            { name: 'Super Splash Party', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Super%20Splash%20Party.webp' },
            { name: 'Three Kingdoms', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Three%20Kingdoms.webp' },
            { name: 'Three Kingdoms 2', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Three%20Kingdoms%202.webp' },
            { name: 'Prosperity New Year', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Prosperity%20New%20Year.webp' },
            { name: 'Joyful Birds', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Joyful%20Birds.webp' },
            { name: 'Fortune Twins', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Fortune%20Twins.webp' },
            { name: 'Beauty of Love', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Beauty%20of%20Love.webp' },
            { name: 'Soccer Fiesta', img: 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-cover/SL/LIVE22/Soccer%20Fiesta.webp' },
        ]
    },
};


const PROVIDER_ORDER = [
    'pragmatic', 'jili', 'mega888', '918kiss', 'pgsoft', 'joker',
    'spadegaming', 'playtech', 'fachai', 'habanero', 'cq9', 'redtiger',
    'netent', 'microgaming', 'pussy888', 'live22'
];

// ==========================================
// STATE
// ==========================================
let currentProvider = 'pragmatic';
let currentFilter = 'all';
let currentGames = [];
let isScanning = false;

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    buildProviderGrid();
    initTypingEffect();
    initFilterTabs();
    initSortSelect();
    initBottomNav();
    initMatrixRain();
    initDeviceIntel();
    loadGames(currentProvider);
    updateTimestamp();
    setInterval(updateTimestamp, 60000);
    setInterval(function() { loadGames(currentProvider); }, SCANNER_CONFIG.seedInterval * 60 * 1000);
});

// ==========================================
// BUILD PROVIDER GRID
// ==========================================
function buildProviderGrid() {
    var grid = document.getElementById('providerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PROVIDER_ORDER.forEach(function(key, i) {
        var p = GAME_DATABASE[key];
        if (!p) return;
        var btn = document.createElement('button');
        btn.className = 'provider-card' + (i === 0 ? ' active' : '');
        btn.setAttribute('data-provider', key);
        btn.innerHTML = '<div class="provider-icon"><img src="' + p.logo + '" alt="' + p.name + '" onerror="this.style.display=\'none\'"></div><span class="provider-name">' + p.name + '</span><span class="provider-check">✓</span>';
        btn.addEventListener('click', function() {
            if (isScanning) return;
            grid.querySelectorAll('.provider-card').forEach(function(c) { c.classList.remove('active'); });
            btn.classList.add('active');
            currentProvider = key;
            startScan();
        });
        grid.appendChild(btn);
    });
}

// ==========================================
// MATRIX RAIN
// ==========================================
function initMatrixRain() {
    var canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var chars = '01アイウエオカキ@#$%&ABCDEF0123456789';
    var fontSize = 12;
    var columns, drops;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; columns = Math.floor(canvas.width / fontSize); drops = new Array(columns).fill(1); }
    resize();
    window.addEventListener('resize', resize);
    setInterval(function() {
        ctx.fillStyle = 'rgba(5, 10, 15, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < columns; i++) {
            var c = chars[Math.floor(Math.random() * chars.length)];
            var b = Math.random();
            ctx.fillStyle = b > 0.7 ? 'rgba(255,107,0,0.35)' : b > 0.4 ? 'rgba(255,140,66,0.2)' : 'rgba(255,80,0,0.1)';
            ctx.font = fontSize + 'px monospace';
            ctx.fillText(c, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 60);
}

// ==========================================
// DEVICE INTELLIGENCE
// ==========================================
function initDeviceIntel() {
    var panel = document.getElementById('deviceIntel');
    if (!panel) return;
    var info = { device: 'Unknown', screen: window.screen.width + '×' + window.screen.height, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language, network: '—', isp: '—', location: '—', ip: '•••.•••.•••.•••' };
    var ua = navigator.userAgent;
    if (/iPhone/.test(ua)) { var m = ua.match(/iPhone\s?OS\s([\d_]+)/); info.device = 'iPhone (iOS ' + (m ? m[1].replace(/_/g, '.') : '') + ')'; }
    else if (/Android/.test(ua)) { var m2 = ua.match(/Android\s([\d.]+);\s*([^;)]+)/); info.device = m2 ? m2[2].trim() + ' (Android ' + m2[1] + ')' : 'Android Device'; }
    else if (/Windows/.test(ua)) info.device = 'Windows PC';
    else if (/Mac/.test(ua)) info.device = 'MacOS';
    try { var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection; if (conn) { info.network = (conn.effectiveType || conn.type || 'unknown').toUpperCase(); if (info.network === '4G') info.network = '4G LTE'; } } catch(e) {}
    fetch('https://ip-api.com/json/?fields=query,isp,city,country').then(function(r) { return r.json(); }).then(function(geo) {
        info.isp = geo.isp || '—'; info.location = (geo.city || '') + ', ' + (geo.country || '');
        var parts = (geo.query || '').split('.'); if (parts.length === 4) info.ip = parts[0] + '.' + parts[1] + '.xxx.' + parts[3];
        renderDevicePanel(info);
    }).catch(function() { renderDevicePanel(info); });
}

function renderDevicePanel(info) {
    var panel = document.getElementById('deviceIntel');
    if (!panel) return;
    panel.innerHTML = '<div class="intel-header"><span>📡</span><span>DEVICE INTELLIGENCE</span><span class="intel-live">● LIVE</span></div><div class="intel-grid">' +
        '<div class="intel-row"><span>📱</span><span>Device</span><span>' + info.device + '</span></div>' +
        '<div class="intel-row"><span>🌐</span><span>ISP</span><span>' + info.isp + '</span></div>' +
        '<div class="intel-row"><span>📍</span><span>Location</span><span>' + info.location + '</span></div>' +
        '<div class="intel-row"><span>📶</span><span>Network</span><span>' + info.network + '</span></div>' +
        '<div class="intel-row"><span>🖥️</span><span>Screen</span><span>' + info.screen + '</span></div>' +
        '<div class="intel-row"><span>🕐</span><span>Timezone</span><span>' + info.timezone + '</span></div>' +
        '<div class="intel-row"><span>🔒</span><span>IP</span><span class="intel-ip">' + info.ip + '</span></div></div>';
}

// ==========================================
// TYPING EFFECT
// ==========================================
function initTypingEffect() {
    var texts = ['Initializing RTP Scanner v4.2.1...', 'Connecting to game servers...', 'Scanning slot RTP data...', 'SQUEEN668 Scanner READY.'];
    var ti = 0, ci = 0;
    var el = document.getElementById('typedText');
    if (!el) return;
    function typeNext() {
        if (ti >= texts.length) ti = 0;
        if (ci < texts[ti].length) { el.textContent += texts[ti].charAt(ci); ci++; setTimeout(typeNext, 40 + Math.random() * 30); }
        else { setTimeout(function() { el.textContent = ''; ci = 0; ti++; typeNext(); }, 2000); }
    }
    typeNext();
}

// ==========================================
// HELPERS
// ==========================================
function randHex(len) { len = len || 8; var r = ''; for (var i = 0; i < len; i++) r += Math.floor(Math.random() * 16).toString(16).toUpperCase(); return r; }
function randIP() { return (Math.floor(Math.random() * 200 + 10)) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255); }
function randPort() { return Math.floor(Math.random() * 9000 + 1000); }
function getStatusLabel(s) { return s === 'hot' ? '🔥 HOT' : s === 'warm' ? '⚡ WARM' : '❄️ COLD'; }
function getStatusEmoji(s) { return s === 'hot' ? '🔥' : s === 'warm' ? '⚡' : '❄️'; }

window.getFallbackImage = function(gameName) {
    if (!gameName) gameName = "GAME";
    var words = gameName.split(' ');
    var initials = words.length > 1 ? (words[0][0] + words[1][0]) : gameName.substring(0, 2);
    initials = initials.toUpperCase();
    var hash = 0;
    for (var i = 0; i < gameName.length; i++) hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
    var colors = ['#FF6B00', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
    var color = colors[Math.abs(hash) % colors.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" fill="#0F141C" />' +
        '<rect width="100" height="100" fill="url(#grad)" opacity="0.4" />' +
        '<defs>' +
            '<radialGradient id="grad" cx="50%" cy="50%" r="50%">' +
                '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.8"/>' +
                '<stop offset="100%" stop-color="#0F141C" stop-opacity="0"/>' +
            '</radialGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="35" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="4 4" opacity="0.3" />' +
        '<text x="50%" y="54%" font-family="sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="2" style="text-shadow: 0 0 10px ' + color + '">' + initials + '</text>' +
        '</svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg);
};

// ==========================================
// HACKER TERMINAL SCAN LOG
// ==========================================
function runTerminalScan(providerName, onComplete) {
    var termBody = document.getElementById('terminalLog');
    var termProgress = document.getElementById('termProgressBar');
    var termPercent = document.getElementById('termPercent');
    if (!termBody) { onComplete(); return; }
    var ip = randIP(), session = randHex(12), port = randPort(), gc = Math.floor(Math.random() * 10 + 15);
    var lines = [
        { text: '[SYS] Initializing SQUEEN668 Scanner v4.2.1...', type: 'info', delay: 300 },
        { text: '[NET] Resolving DNS → sq668-sg1.internal.io', type: 'normal', delay: 500 },
        { text: '[NET] Connection established: ' + ip + ':' + port, type: 'normal', delay: 400 },
        { text: '[AUTH] Authenticating session: ' + session, type: 'normal', delay: 600 },
        { text: '[AUTH] Session verified ✓', type: 'success', delay: 300 },
        { text: '[SCAN] Target: ' + providerName + ' • SQUEEN668', type: 'info', delay: 400 },
        { text: '[SCAN] Accessing RTP memory block 0x' + randHex(4) + '...', type: 'normal', delay: 500 },
        { text: '[WARN] Firewall detected — bypassing...', type: 'warning', delay: 700 },
        { text: '[SCAN] Firewall bypassed ✓', type: 'success', delay: 400 },
        { text: '[DATA] Reading slot tables: ' + gc + ' entries found', type: 'normal', delay: 500 },
        { text: '[DATA] Decrypting percentage values [AES-256]...', type: 'normal', delay: 600 },
        { text: '[DATA] Mapping RTP distributions...', type: 'normal', delay: 400 },
        { text: '[DATA] Cross-referencing hot patterns [0x' + randHex(4) + ']', type: 'normal', delay: 500 },
        { text: '[CALC] Running probability analysis...', type: 'normal', delay: 400 },
        { text: '[SYS] Compiling results ██████████ 100%', type: 'info', delay: 300 },
        { text: '[DONE] Scan complete — ' + gc + ' games analyzed ✓', type: 'success', delay: 200 },
    ];
    termBody.innerHTML = '';
    var cumDelay = 0;
    lines.forEach(function(line, i) {
        cumDelay += line.delay;
        setTimeout(function() {
            var div = document.createElement('div');
            div.className = 'term-line term-' + line.type;
            if (i === lines.length - 1) div.classList.add('term-latest');
            div.textContent = line.text;
            termBody.appendChild(div);
            termBody.scrollTop = termBody.scrollHeight;
            var pct = Math.round(((i + 1) / lines.length) * 100);
            if (termProgress) termProgress.style.width = pct + '%';
            if (termPercent) termPercent.textContent = 'sq668_scanner.exe — ' + pct + '%';
            if (i === lines.length - 1) setTimeout(onComplete, 500);
        }, cumDelay);
    });
}

// ==========================================
// SCANNING FLOW
// ==========================================
function startScan() {
    if (isScanning) return;
    isScanning = true;
    var scanSection = document.getElementById('scanningSection');
    var resultsSection = document.getElementById('resultsSection');
    var gameList = document.getElementById('gameList');
    var top3Section = document.getElementById('top3Section');
    var pName = GAME_DATABASE[currentProvider] ? GAME_DATABASE[currentProvider].name : currentProvider.toUpperCase();
    scanSection.style.display = 'block';
    resultsSection.style.display = 'none';
    gameList.innerHTML = '';
    if (top3Section) top3Section.innerHTML = '';
    var sd = document.getElementById('scanDetail');
    if (sd) sd.textContent = 'Target: ' + pName + ' • SQUEEN668';
    scanSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    runTerminalScan(pName, function() {
        var flash = document.getElementById('scanFlash');
        if (flash) { flash.classList.add('active'); setTimeout(function() { flash.classList.remove('active'); }, 400); }
        document.body.classList.add('scan-shake');
        setTimeout(function() { document.body.classList.remove('scan-shake'); }, 500);
        scanSection.style.display = 'none';
        resultsSection.style.display = 'block';
        isScanning = false;
        loadGames(currentProvider);
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ==========================================
// GENERATE RTP (time-seeded)
// ==========================================
function generateResults(providerKey) {
    var provider = GAME_DATABASE[providerKey];
    if (!provider) return [];
    var allGames = provider.games;
    var seed = getTimeSeed(providerKey, SCANNER_CONFIG.seedInterval);
    var rand = seededRandom(seed);
    var cfg = SCANNER_CONFIG;
    return allGames.map(function(g, i) {
        var tierRoll = rand() * 100;
        var rtp, status;
        var gameRand = seededRandom(seed + i + 1);
        gameRand();
        if (tierRoll < cfg.hotPercent) { rtp = Math.floor(gameRand() * (cfg.maxRtp - cfg.hotThreshold + 1) + cfg.hotThreshold); status = 'hot'; }
        else if (tierRoll < cfg.hotPercent + cfg.warmPercent) { rtp = Math.floor(gameRand() * (cfg.hotThreshold - cfg.warmThreshold) + cfg.warmThreshold); status = 'warm'; }
        else { rtp = Math.floor(gameRand() * (cfg.warmThreshold - cfg.minRtp) + cfg.minRtp); status = 'cold'; }
        return { name: g.name, img: g.img, provider: provider.name, rtp: rtp, status: status };
    }).sort(function(a, b) { return b.rtp - a.rtp; });
}

function loadGames(providerKey) {
    currentGames = generateResults(providerKey);
    currentGames.forEach(function(g, i) { g.rank = i + 1; });
    updateStats();
    renderTop3();
    renderGames();
}

// ==========================================
// SVG CIRCULAR GAUGE
// ==========================================
function createRtpGauge(rtp, size) {
    size = size || 52;
    var sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r, o = c - (rtp / 100) * c;
    var color = rtp >= 85 ? '#22C55E' : rtp >= 65 ? '#F59E0B' : '#EF4444';
    return '<div class="rtp-gauge" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="' + sw + '"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + o + '" class="gauge-fill" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')"/></svg><span class="gauge-text" style="color:' + color + '">' + rtp + '%</span></div>';
}

// ==========================================
// TOP 3 PODIUM
// ==========================================
function renderTop3() {
    var section = document.getElementById('top3Section');
    if (!section || currentGames.length < 3) return;
    var top3 = currentGames.slice(0, 3);
    var medals = ['👑', '🥈', '🥉'], classes = ['gold', 'silver', 'bronze'];
    var html = '<h3 class="top3-heading">🏆 Top 3 Game Terpanas</h3><div class="top3-cards">';
    top3.forEach(function(game, i) {
        html += '<div class="top3-card top3-' + classes[i] + '" style="animation-delay:' + (i * 0.15) + 's"><span class="top3-medal">' + medals[i] + '</span><div class="top3-thumb"><img src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="top3-name">' + game.name + '</span>' + createRtpGauge(game.rtp, 50) + '<span class="top3-status top3-status-' + game.status + '">' + getStatusLabel(game.status) + '</span></div>';
    });
    section.innerHTML = html + '</div>';
}

// ==========================================
// STATS
// ==========================================
function updateStats() {
    var hot = currentGames.filter(function(g) { return g.status === 'hot'; }).length;
    var warm = currentGames.filter(function(g) { return g.status === 'warm'; }).length;
    var cold = currentGames.filter(function(g) { return g.status === 'cold'; }).length;
    animateCounter('statHot', hot); animateCounter('statWarm', warm); animateCounter('statCold', cold);
    document.getElementById('statProviders').textContent = PROVIDER_ORDER.length;
    document.getElementById('totalGames').textContent = currentGames.length;
}
function animateCounter(id, target) {
    var el = document.getElementById(id); if (!el) return;
    var cur = parseInt(el.textContent) || 0; if (cur === target) return;
    var step = target > cur ? 1 : -1;
    var t = setInterval(function() { cur += step; el.textContent = cur; if (cur === target) clearInterval(t); }, 50);
}

// ==========================================
// RENDER GAMES
// ==========================================
function renderGames() {
    var gameList = document.getElementById('gameList');
    if (!gameList) return;
    var filtered = currentFilter === 'all' ? currentGames.slice(3) : currentGames.filter(function(g) { return g.status === currentFilter; });
    gameList.innerHTML = '';
    if (!filtered.length) { gameList.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim);font-size:12px;">Tiada game ditemui untuk filter ini.</div>'; return; }
    filtered.forEach(function(game, index) {
        var card = document.createElement('div');
        card.className = 'game-card ' + game.status;
        card.style.animationDelay = (index * 0.04) + 's';
        var rankNum = currentFilter === 'all' ? index + 4 : index + 1;
        card.innerHTML = '<div class="game-rank">#' + rankNum + '</div><div class="game-thumb"><img src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><div class="game-info"><div class="game-name">' + game.name + '</div><div class="game-provider-name">' + game.provider + '</div><div class="game-rtp-bar"><div class="game-rtp-fill ' + game.status + '" style="width:0%"></div></div></div><div class="game-rtp-value">' + createRtpGauge(game.rtp, 48) + '<span class="rtp-label ' + game.status + '">' + getStatusEmoji(game.status) + ' ' + game.status.toUpperCase() + '</span></div>';
        gameList.appendChild(card);
        setTimeout(function() { var fill = card.querySelector('.game-rtp-fill'); if (fill) fill.style.width = Math.max(0, Math.min(100, ((game.rtp - 25) / 75) * 100)) + '%'; }, 100 + index * 60);
    });
}

// ==========================================
// FILTER / SORT / NAV
// ==========================================
function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active'); currentFilter = this.getAttribute('data-filter'); renderGames();
        });
    });
}
function initSortSelect() {
    var select = document.getElementById('sortSelect'); if (!select) return;
    select.addEventListener('change', function() {
        if (this.value === 'rtp-desc') currentGames.sort(function(a, b) { return b.rtp - a.rtp; });
        else if (this.value === 'rtp-asc') currentGames.sort(function(a, b) { return a.rtp - b.rtp; });
        else if (this.value === 'name') currentGames.sort(function(a, b) { return a.name.localeCompare(b.name); });
        currentGames.forEach(function(g, i) { g.rank = i + 1; }); renderTop3(); renderGames();
    });
}
function initBottomNav() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) { e.preventDefault(); document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); }); this.classList.add('active'); });
    });
}
function updateTimestamp() {
    var el = document.getElementById('lastUpdate'); if (el) el.textContent = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// SHARE
// ==========================================
function shareResults(method) {
    if (!currentGames.length) return;
    var pName = GAME_DATABASE[currentProvider] ? GAME_DATABASE[currentProvider].name : currentProvider;
    var now = new Date().toLocaleString('ms-MY');
    var top5 = currentGames.slice(0, 5);
    var text = '🛡️ *SQUEEN668 SCAN RESULT*\n🎮 Provider: ' + pName + '\n📅 ' + now + '\n────────────────────\n\n🏆 *TOP 5 GAME:*\n\n';
    top5.forEach(function(g, i) { text += (i+1) + '. ' + g.name + '\n   RTP: ' + g.rtp + '% ' + getStatusEmoji(g.status) + ' ' + g.status.toUpperCase() + '\n\n'; });
    text += '────────────────────\n🚀 Scan PERCUMA di SQUEEN668!\n';
    if (method === 'whatsapp') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    else if (method === 'telegram') window.open('https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(text), '_blank');
    else navigator.clipboard.writeText(text).then(function() { var btn = document.querySelector('.share-btn-copy span'); if (btn) { btn.textContent = '✅'; setTimeout(function() { btn.textContent = '📋'; }, 2000); } });
}

window.startScan = startScan;
window.shareResults = shareResults;
console.log('%c SQUEEN668 RTP Scanner v4.2.1 ', 'background: #ff6b00; color: white; font-weight: bold; padding: 5px 10px; border-radius: 5px;');
