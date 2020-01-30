//import libs
const alphabet = require('alphabet');
const request = require('request');
const sha1 = require('crypto');
const fs = require('fs');

//create global variables
const codenationToken = 'deca6be2ba8e26cca57f29630a8f1e51e6277f0a';
const baseUri = 'https://api.codenation.dev/v1/challenge/dev-ps';
const tokenParameter = '?token=' + codenationToken;
const getUri = baseUri + '/generate-data' + tokenParameter;
const submitUri = baseUri + '/submit-solution' + tokenParameter;

const filepath = 'answer.json';

//methods to use
const createFile = (data, isJson) => {
    if(isJson){
        data = JSON.stringify(data);
    }
    
    fs.writeFileSync(filepath, data, (error) => {
        if(error){
            console.log('error', error.message);
        }
    });
};

const discoverLetterPosition = (l) => {
    const letterArray = alphabet.lower;
    
    for(let i = 0; i < letterArray.length; i++){        
        if(l == letterArray[i]){
            return i;
        }
    }
};

const decrypt = (text, numberToSkip) => {
    const letters = text.split('');
    const alphabetCount = alphabet.lower.length;
    let decrypText = '';

    for(let letter of letters){
        if(letter.match(/\w/)){
            let letterPosition = discoverLetterPosition(letter);
            let skip = letterPosition - numberToSkip;

            if(skip < 0){
                skip = alphabetCount - (skip * -1);
            }

            decrypText += alphabet.lower[skip];
        }else{
            decrypText += letter;
        }
    }

    return decrypText;
};

const cryptoSha1 = (text) => {
    const hash = sha1.createHash('sha1');
    hash.update(text);
    return hash.digest('hex');
};

const submit = () => {    
    const req = request.post(submitUri, function (error, response) {
        if(error){
            console.log(`error: ${error}`);
        }else{
            console.log(`response: ${response.body}`);
        }
    });

    const form = req.form();
    form.append('answer', fs.createReadStream(filepath));
};

//main method (execute all)
const main = () => {
    request(getUri, {json: true}, (error, response, body) => {
        if(error){
            console.log(`error: ${error}`);
        }else{
            createFile(body, true);
            
            const text = decrypt(body.cifrado, body.numero_casas);
    
            const sha1Text = cryptoSha1(text);
    
            body.decifrado = text
            body.resumo_criptografico = sha1Text;
    
            createFile(body, true);
            submit();
        }
    });
};

//call the main method
main();