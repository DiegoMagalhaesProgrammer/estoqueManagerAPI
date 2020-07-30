const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const rotaProduto = require('./routes/produto');
const rotaCategoria = require('./routes/categoria');

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
app.use('/categoria', rotaCategoria);


module.exports = app;