const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const rotaProduto = require('./routes/produto');
//const rotaPrecificacao = require('./routes/precificacao');
//const rotaCategoria = require('./routes/categoria');
//const rotaestoqueProduto = require('./routes/estoque');
//const rotaInformacoes = require('./routes/informacoesproduto');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With,Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }

    next();
})

app.use('/produto', rotaProduto);
//app.use('/precificacao', rotaPrecificacao);
//app.use('/categoria', rotaCategoria);
//app.use('/estoque', rotaestoqueProduto);
//app.use('/rotaInformacoes', rotaInformacoes);


module.exports = app;