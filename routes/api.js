var express = require('express');
var router = express.Router();
var moment = require('moment');

/* GET users listing. */
module.exports = (db) => {

  // ============ Load Data ================
  router.get('/', function (req, res) {
    let isSearch = false;
    const page = parseInt(req.query.page) || 1;
    const { id, string, integer, float, startDate, endDate, boolean, cId, cString, cInteger, cFloat, cDate, cBoolean } = req.query;
    let query = [];
    if (cId && id) {
      query.push(`id = '${id}'`);
      isSearch = true;
    }
    if (cString && string) {
      query.push(`stringdata LIKE  '%${string}%'`);
      isSearch = true;
    }
    if (cInteger && integer) {
      query.push(`integerdata = ${integer}`);
      isSearch = true;
    }
    if (cFloat && float) {
      query.push(`floatdata = ${float}`);
      isSearch = true;
    }
    if (cBoolean && boolean) {
      query.push(`booleandata = '${boolean}'`);
      isSearch = true;
    }

    if (cDate && startDate && endDate) {
      query.push(` datedata BETWEEN '${startDate}' AND '${endDate}'`);
      isSearch = true;
    }

    let search = "";
    if (isSearch) {
      search += `WHERE ${query.join(' AND ')}`;
    }
    console.log(search);

    const limit = 3;
    const offset = (page - 1) * limit;

    let sqlPages = `SELECT COUNT (id) as total FROM bread ${search}`;
    db.query(sqlPages, (err, data) => {
      if (err) return res.status(500).json({
        error: true,
        message: err
      }) 
      else if (data.rows[0].total == 0) {
        return res.send(`Data yang Anda Cari tidak ditemukan`);
      }
      const totalData = parseInt(data.rows[0].total); 
      const pages = Math.ceil(totalData / limit);
     
      let sql = `SELECT * FROM bread ${search} ORDER BY id LIMIT $1 OFFSET $2`;
      db.query(sql, [limit, offset], (err, data) => {
        if (err) {
          return res.send(err);
        } else if (data.rows == 0) {
          return res.send(`data can not be found`);
        }
        else {
          res.status(200).json({
            data: data.rows,
            pages,
            page
          });
        }
      });
    })
  });

  // ============== Show Data ===============
  router.get('/:id', function (req, res, next) {
    let id = req.params.id;
    let sql = `SELECT * FROM bread WHERE id = ${id}`;
    db.query(sql, (err, data) => {
      if (err) {
        return res.send(err);
      } else if (data.rows == 0) {
        return res.send(`data can not be found`);
      }
      else {
        res.status(200).json({
          data: data.rows[0],
          moment
        });
      }
    });
  });

  // ============== Delete Data ===============
  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const sql = `DELETE FROM bread WHERE id = $1`;
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({
        error: true,
        message: err
      })
      res.status(201).json({
        message: "data berhasil dihapus"
      })
    })
  })

  // ============== find Data ===============
  router.put('/:id', (req, res) => {
    let sql = `UPDATE bread SET stringdata = $2, integerdata = $3, floatdata = $4, booleandata = $5, datedata = $6  WHERE id = $1`
    let edit = [parseInt(req.params.id), req.body.stringdata, parseInt(req.body.integerdata), parseFloat(req.body.floatdata), JSON.parse(req.body.booleandata), req.body.datedata];
    db.query(sql, edit, (err) => {
      if (err) return res.status(500).json({
        error: true,
        message: err
      })
      res.status(201).json({
        error: false,
        message: "data berhasil diganti"
      })
    })
  });

  // ============== Add Data ===============
  router.post('/', function (req, res) {
    let sql = 'INSERT INTO bread (stringdata, integerdata, floatdata, booleandata, datedata) VALUES  ($1,$2,$3,$4,$5)';
    let add = [req.body.stringdata, parseInt(req.body.integerdata), parseFloat(req.body.floatdata), JSON.parse(req.body.booleandata), req.body.datedata];
    db.query(sql, add, (err) => {
      if (err) return res.status(500).json({
        error: true,
        message: err
      })
      res.status(201).json({
        error: false,
        message: 'data berhasil ditambahkan'
      })
    });
  });

  return router;
}