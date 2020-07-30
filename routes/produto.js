const { response } = require('..');

const express = require('express').Router();
const mysql = require('../mysql').pool;

//* Retorna o saldo de estoque de um produto

express.get('/:nome/estoque/saldo', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `CALL returnSaldo((select entrada from estoque where id_produto = 
                (select id from produto where nome = "${req.params.nome}")), 
                (select saidas from estoque where id_produto = 
                (select id from produto where nome = "${req.params.nome}")))`,
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: resultado[0][0].SALDO })
            }
        )

    })
});

//* Altera o preco de um produto(compra e venda)
express.patch('/:nome/preco', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        let preCompra;
        let preVenda;
        if (req.body.precoCompra != undefined && req.body.precoCompra != null) {
            preCompra = req.body.precoCompra;
        } else {
            return res.status(500).send({ mensagem: "O valor informado para o preço de compra não vale!" })
        }
        if (req.body.precoVenda != undefined && req.body.precoVenda != null) {
            preVenda = req.body.preVenda;
        } else {
            return res.status(500).send({ mensagem: "O valor informado para preço de venda não vale!" })
        }

        conn.query(
            `UPDATE PRECIFICACAO SET PRECO_COMPRA = ${preCompra}, 
            PRECO_VENDA = ${preVenda} where id_produto = 
            (select id from produto where nome = "${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    if (error.errno == 1054) {
                        return res.status(500).send(
                            { mensagem: "O valor informado não é válido" })
                    }
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(202).send({
                    mensagem: resultado
                    // id_produto: resultado.insertId
                });
            }
        )

    })
})

//* Altera o preco de compra de um produto
express.patch('/:nome/preco/compra', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        let preCompra;
        if (req.body.precoCompra != undefined && req.body.precoCompra != null) {
            preCompra = req.body.precoCompra;
        } else {
            return res.status(500).send({ mensagem: "O valor informado para o preço de compra não vale!" })
        }

        conn.query(
            `UPDATE PRECIFICACAO SET PRECO_COMPRA = ${preCompra} where id_produto = 
            (select id from produto where nome = "${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    if (error.errno == 1054) {
                        return res.status(500).send(
                            { mensagem: "O valor informado não é válido" })
                    }
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(202).send({
                    mensagem: `O preço de compra do produto - ${req.params.nome} - foi alterado com sucesso!`
                    // id_produto: resultado.insertId
                });
            }
        )

    })
})

//* Altera o preco de venda de um produto
express.patch('/:nome/preco/venda', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        let preVenda;
        if (req.body.precoVenda != undefined && req.body.precoVenda != null) {
            preVenda = req.body.precoVenda;
        } else {
            return res.status(500).send({ mensagem: "O valor informado para o preço de venda não vale!" })
        }

        conn.query(
            `UPDATE PRECIFICACAO SET PRECO_VENDA = ${preVenda} where id_produto = 
            (select id from produto where nome = "${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    if (error.errno == 1054) {
                        return res.status(500).send(
                            { mensagem: "O valor informado não é válido" })
                    }
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(202).send({
                    mensagem: `O preço de venda do produto - ${req.params.nome} - foi alterado com sucesso!`
                    // id_produto: resultado.insertId
                });
            }
        )

    })
})

//* DEVO TER APENAS DOIS ENDPOINTS: um pra PRODUTO e um pra CATEGORIA, e pra cadastrar um produto, já devo fazer tudo junto(preço, estoque ...)
//* Em produto, devo ter Patch /estoque, /preco, /informacoes e um /produto

//* CRIAR PRODUTO
express.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }

        let estoqueInicial = req.body.estoqueInicial;
        let categoriaProduto = req.body.categoriaProduto;
        let precoCompra = req.body.precoCompra;
        let precoVenda = req.body.precoVenda;
        let foto = req.body.foto;
        let descricao = req.body.descricao;

        if (req.body.estoqueInicial == undefined || estoqueInicial == null) {
            estoqueInicial = 0;
        }
        if (req.body.categoriaProduto == undefined || req.body.categoriaProduto == null) {
            categoriaProduto = null;
        }
        if (req.body.precoCompra == undefined || req.body.precoCompra == null) {
            precoCompra = 0;
        }
        if (req.body.precoVenda == undefined || req.body.precoVenda == null) {
            precoVenda = 0;
        }
        if (req.body.foto == undefined || req.body.foto == null) {
            foto = null;
        }
        if (req.body.descricao == undefined || req.body.foto == null) {
            descricao = null;
        }
        conn.query(
            `CALL initialValues("${req.body.nome}", ${estoqueInicial}, 
                ${categoriaProduto}, ${precoCompra}, ${precoVenda},
                "${foto}", "${descricao}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    if (error.errno == 1062) {
                        return res.status(500).send({
                            error: error,
                            mensagem: 'Produto já cadastrado!'
                        })
                    } else {
                        return res.status(500).send({
                            error: error,
                            response: null
                        })
                    }
                }
                res.status(201).send({
                    mensagem: 'Produto criado com sucesso',
                    id_produto: resultado.insertId
                });
            }
        )
    })
})


//* Altera Nome Produto:
express.patch('/:nome', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        if (req.body.newname == undefined || req.body.newname == null) {
            return res.status(500).send({ mensagem: "O nome informado não é válido!" })
        }

        conn.query(
            `UPDATE PRODUTO SET nome = "${req.body.newname}" 
            where id = (select produto.id where nome ="${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                res.status(202).send({
                    mensagem: `O nome do produto - ${req.params.nome} - foi alterado com sucesso!`,
                }
                )

            })
    })
})

express.get('/:id_produto', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM produto where id = (?);',
            [req.params.id_produto],
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }

                return res.status(200).send({ response: resultado })
            }
        )

    })
})

//* Altera estoque de um produto
express.patch('/:nome/estoque', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        let entrada;
        let saidas;
        if (req.body.entrada != undefined && req.body.entrada != null) {
            entrada = req.body.entrada;
        } else {
            entrada = 0;
        }
        if (req.body.saidas != undefined && req.body.saidas != null) {
            saidas = req.body.saidas;
        } else {
            saidas = 0;
        }
        conn.query(
            `UPDATE estoque set entrada = (entrada + ${entrada}),
             saidas = (saidas + ${saidas}) where id_produto = (select id from produto where nome = "${req.params.nome}")`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(202).send({
                    mensagem: resultado
                    // id_produto: resultado.insertId
                });
            }
        )
    })
})

//* Altera foto de um produto
express.patch('/:nome/informacoes/foto', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        //let foto = req.body.foto;

        if (req.body.foto == undefined || req.body.foto == null || req.body.foto == '') {
            res.status(500).send({ mensagem: "O valor informado não é válido!" })
        } else {
            conn.query(
                `UPDATE informacoesproduto SET foto = "${req.body.foto}"
                where id_produto = (select id from produto where nome = "${req.params.nome}")`,
                (error, resultado, field) => {
                    conn.release();
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: resultado
                        });
                    }
                    res.status(202).send({
                        mensagem: resultado
                        // id_produto: resultado.insertId
                    });
                }
            )
        }
    })
})

//* Altera descricao de um produto
express.patch('/:nome/informacoes/descricao', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        let descricao = req.body.descricao;

        if (descricao == undefined || descricao == null) {
            res.status(500).send({ mensagem: "O valor informado não é válido!" })
        } else {
            conn.query(
                `UPDATE informacoesproduto SET descricao = "${descricao}"
                where id_produto = (select id from produto where nome = "${req.params.nome}")`,
                (error, resultado, field) => {
                    conn.release();
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null
                        });
                    }
                    res.status(202).send({
                        mensagem: resultado
                    });
                }
            )
        }
    })
})

//* Altera categoria de um produto
express.patch('/:nome/informacoes/categoria', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        let idCategoria = req.body.idCategoria;

        if (idCategoria == undefined || idCategoria == null) {
            res.status(500).send({ mensagem: "O valor informado não é válido!" })
        } else {
            conn.query(
                `UPDATE informacoesproduto SET categoria_id = "${idCategoria}"
                where id_produto = (select id from produto where nome = "${req.params.nome}")`,
                (error, resultado, field) => {
                    conn.release();
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null
                        });
                    }
                    res.status(202).send({
                        mensagem: resultado
                    });
                }
            )
        }
    })
})

//* Deleta um produto
express.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.error(error); res.status(500).send({ error: error }) }
        conn.query(
            `call deleteProdutoAll((select id from produto where nome = "${req.body.nome}"),
             "${req.body.nome}",
              (select entrada from estoque where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select saidas from estoque where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select preco_compra from precificacao where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select preco_venda from precificacao where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select foto from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select descricao from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")),
              (select id_categoria from informacoesproduto where id_produto = (select id from produto where nome = "${req.body.nome}")));`,
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(202).send({
                    mensagem: 'Produto excluído com sucesso',
                });
            }
        )
    })
})

//* RETORNA O SALDO DO PREÇO
express.get('/:nome/preco/saldo', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `CALL saldoPreco((select preco_compra from precificacao where id_produto = 
                (select id from produto where nome = "${req.params.nome}")), 
                (select preco_venda from precificacao where id_produto = 
                (select id from produto where nome = "${req.params.nome}")))`,
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: 'R$ ' + (resultado[0][0].SALDO_LUCRO_PREJUÍZO).toFixed(2) })
            }
        )

    })
});

//* RETORNA INFORMAÇÕES ESSENCIAIS DOS PRODUTOS
express.get('/info/todos', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `call infoEssentials();`,
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(404).send({ error: error }) }
                return res.status(200).send({ response: resultado })
            }
        )

    })
});


module.exports = express;