/*global _ m comp db state autoForm schemas updateBoth lookUser hari makeModal tds*/

_.assign(comp, {
  transfer: () => !_.includes([3, 4], state.login.bidang) ?
  m('p', 'Hanya untuk user farmasi dan apotik') : m('.content',
    m('h3', 'Daftar antrian amprah'),
    m('table.table',
      {onupdate: () => [
        db.users.toArray(array =>
          state.userList = array
        ),
        db.goods.toArray(array => [
          state.transferList = array.reduce((a, b) =>
            b.batch ? a.concat(b.batch.reduce((c, d) =>
              d.amprah ? c.concat(d.amprah.reduce((e, f) =>
                e.concat([_.merge(f, {
                  idbarang: b._id, nama_barang: b.nama,
                  idbatch: d.idbatch, no_batch: d.no_batch,
                  digudang: d.stok.gudang
                })])
              , [])) : c
            , [])) : a
          , []), m.redraw()
        ])
      ]},
      m('thead', m('tr',
        ['Nama barang', 'No. Batch', 'Peminta', 'Jumlah minta', 'Tanggal diminta', 'Penyerah', 'Jumlah serah', 'Tanggal serah']
        .map((i => m('th', i)))
      )),
      m('tbody', state.transferList &&
        state.transferList.map(i => m('tr',
        {ondblclick: () => [
          _.assign(state, {
            oneAmprah: i, modalResponAmprah: m('.box',
              m('h4', 'Respon permintaan barang'),
              m('table.table',
                m('thead', m('tr',
                  ['Nama barang', 'No. Batch', 'Stok gudang', 'Jumlah minta']
                  .map(j => m('th', j))
                )),
                m('tbody', m('tr', tds([
                  i.nama_barang, i.no_batch, i.digudang, i.diminta
                ])))
              ),
              m(autoForm({
                id: 'formResponAmprah', schema: schemas.responAmprah,
                action: doc =>
                  db.goods.get(i.idbarang, barang => [
                    updateBoth('goods', i.idbarang, _.assign(barang, {batch:
                      barang.batch.map(a =>
                        a.idbatch === i.idbatch ?
                        _.assign(a, {
                          stok: {
                            gudang: a.stok.gudang - doc.diserah,
                            apotik: (a.stok.apotik || 0) + doc.diserah
                          },
                          amprah: a.amprah.map(b =>
                            b.idamprah === i.idamprah ?
                            _.assign(b, doc) : b
                          )
                        }) : a
                      )
                    })),
                    state.modalResponAmprah = null, 
                    m.redraw()
                  ])            
              }))
            )
          }),
          m.redraw()
        ]},
        !i.penyerah && tds([
          i.nama_barang, i.no_batch,
          lookUser(i.peminta), i.diminta, hari(i.tanggal_minta),
          lookUser(i.penyerah), i.diserah, hari(i.tanggal_serah)
        ])
      ))),
      makeModal('modalResponAmprah')
    ),
    m('p'),
    m('h3', 'Daftar riwayat amprah'),
    m('table.table',
      m('thead', m('tr',
        ['Nama barang', 'No. Batch', 'Peminta', 'Jumlah minta', 'Tanggal diminta', 'Penyerah', 'Jumlah serah', 'Tanggal serah']
        .map(i => m('th', i))
      )),
      m('tbody', state.transferList &&
        state.transferList.map(i => m('tr',
          i.penyerah && tds([
            i.nama_barang, i.no_batch,
            lookUser(i.peminta), i.diminta, hari(i.tanggal_minta),
            lookUser(i.penyerah), i.diserah, hari(i.tanggal_serah)
          ])
        ))
      )
    )
  )
})