const { response } = require('..');

const express = require('express').Router();
const mysql = require('../mysql').pool;

express.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM produto where nome = (?);',
            [req.body.nome],
            (error, resultado, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: resultado })
            }
        )

    })
});


express.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO PRODUTO(NOME) VALUES(?);',
            [
                req.body.nome
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(201).send({
                    mensagem: 'Produto criado com sucesso',
                    id_produto: resultado.insertId
                });
            }
        )
    })
})

express.get('/:id_produto', (req, res, next) => {
    const id = req.params.id_produto;
    res.status(200).send({
        mensagem: 'Usando o GET de um produto específico',
        id: id
    })
})
module.exports = express;

