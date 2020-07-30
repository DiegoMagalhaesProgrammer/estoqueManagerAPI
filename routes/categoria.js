const { response } = require('..');

const express = require('express').Router();
const mysql = require('../mysql').pool;

express.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        let categoriaNome = `"${req.body.nome}"`;
        let categoriaDesc = `"${req.body.descricao}"`;

        if (req.body.descricao == undefined || req.body.descricao == null || req.body.descricao == '') {
            categoriaDesc = null;
        }
        if (req.body.nome == undefined || req.body.nome == null || req.body.nome == '') {
            res.status(500).send({ mensagem: "O valor informado para o nome da categoria não é válido!" })
        } else {
            conn.query(
                `INSERT INTO categoria (nome, descricao) VALUES (${categoriaNome}, ${categoriaDesc})`,
                (error, result, field) => {
                    conn.release();
                    if (error) {
                        if (error.errno == 1062) {
                            return res.status(500).send({
                                error: error,
                                mensagem: 'Categoria já cadastrada!'
                            })
                        } else {
                            return res.status(500).send({
                                error: error,
                                response: null
                            })
                        }
                    }
                    res.status(201).send({
                        mensagem: 'Categoria criada com sucesso',
                    });
                }
            )
        }
    })
})

//* Deleta uma categoria
express.delete('/:nome', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM categoria WHERE id = (select categoria.id where nome = "${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: resultado
                    });
                }
                res.status(202).send({
                    mensagem: 'Categoria excluída com sucesso',
                });
            }
        )
    })
})

//* Deletar todos os produtos de uma determinada categoria:
express.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        conn.query(
            `call deleteProdutoAllFromCategoria((select id from produto where nome = "${req.body.nome}"),
            "${req.body.nome}",
             (select entrada from estoque where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select saidas from estoque where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select preco_compra from precificacao where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select preco_venda from precificacao where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select foto from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select descricao from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")),
             (select id_categoria from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")))`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: resultado
                    });
                }
                res.status(202).send({
                    mensagem: 'Categoria excluída com sucesso',
                });
            }
        )
    })
})


module.exports = express;