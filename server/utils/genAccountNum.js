
function genAccNum(){
    let nums = '0123456789'
    let acc = nums.split('').sort(() => Math.random() - 0.5).join('');
    return acc
};

module.exports = {genAccNum};