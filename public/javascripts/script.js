
$(document).ready(() => {
    loadData();

    $('table tbody').on('click', '.btn-edit', function (e) {
        let id = $(this).attr('dataid');
        dataModal(id);
    });

    $('.btn-edit').on('click', '.btn-change', function (e) {
        let id = $('#editId').val();
        let string = $('#editString').val();
        let integer = $('#editInteger').val();
        let float = $('#editFloat').val();
        let date = $('#editDate').val();
        let bool = $('#editBoolean').val();
        editData(id, string, integer, float, date, bool);
    })

    $('.btn-add').on('click', '.btn-save', function (e) {
        let string = $('#addString').val();
        let integer = $('#addInteger').val();
        let float = $('#addFloat').val();
        let date = $('#addDate').val();
        let bool = $('#addBoolean').val();
        addData(string, integer, float, date, bool);
    })

    $('table tbody').on('click', '.btn-delete', function () {
        if (confirm('Yakin data akan dihapus?')) {
            let id = $(this).attr('dataid');
            deleteData(id);
        }
    });

    $('nav').on('click', 'li', function (e) {
        e.preventDefault();
        $('#page').val($(this).attr('pageid'));
        loadData();
    })

    $('#searchForm').submit(function (e) {
        e.preventDefault();
        $('#page').val(1);
        loadData();
    });

    $('#reset').on('click', function (e) {
        loadData();
    })
})

// ==================== Load Data ======================================
const loadData = () => {
    let page = $('#page').val();
    let id = $('#id').val();
    let integer = $('#integer').val();
    let string = $('#string').val();
    let float = $('#float').val();
    let startDate = $('#startDate').val();
    let endDate = $('#endDate').val();
    let boolean = $('#boolean').val();
    let cId = $("input[type=checkbox][name=checkId]:checked").val();
    let cInteger = $("input[type=checkbox][name=checkInteger]:checked").val();
    let cString = $("input[type=checkbox][name=checkString]:checked").val();
    let cFloat = $("input[type=checkbox][name=checkFloat]:checked").val();
    let cDate = $("input[type=checkbox][name=checkDate]:checked").val();
    let cBoolean = $("input[type=checkbox][name=checkBoolean]:checked").val();

    $.ajax({
        methdod: "GET",
        url: "http://localhost:3000/api/",
        data: { page, id, string, integer, float, startDate, endDate, boolean, cId, cString, cFloat, cInteger, cDate, cBoolean },
        dataType: "json"
    }).done(result => {
        const data = result.data;
        let page = result.page;
        let pages = result.pages;
        let html = "";
        let pagination = "";
        console.log(`page:${page}, pages:${pages}`)
        data.forEach(item => {
            html += `<tr>
                    <td>${item.id}</td>
                    <td>${item.stringdata}</td>
                    <td>${item.integerdata}</td>
                    <td>${item.floatdata}</td>
                    <td>${moment(item.datedata).format('DD-MMMM-YYYY')}</td>
                    <td>${item.booleandata}</td>
                    <td>
                      <button type="button" class="btn btn-success btn-edit" dataid="${item.id}" data-toggle="modal" data-target="#editModal"> Edit </button>
                      <button type="button" class="btn btn-danger btn-delete" dataid="${item.id}"> Delete </button>
                    </td>                  
                </tr>`
        });
        if (page == 1) {
            pagination += `<li class="page-item prevoius disabled" pageid="${page - 1}"><a class="page-link" href="#">Previous</a></li>\n`;
        } else {
            pagination += `<li class="page-item previous" pageid=${page - 1}><a class="page-link" href="#">Previous</a></li>\n`;
        }
        for (i = 1; i <= pages; i++) {
            if (i == page) {
                pagination += `<li class="page-item active" pageid="${i}"><a class="page-link" href="#">${i}</a></li>\n`;
            } else {
                pagination += `<li class="page-item" pageid="${i}"><a class="page-link" href="#">${i}</a></li>\n`;
            }
        }

        if (page == parseInt(pages)) {
            pagination += `<li class="page-item next disabled" pageid="${page + 1}"><a class="page-link" href="#">Next</a></li>\n`;
        } else {
            pagination += `<li class="page-item next" pageid=${page + 1}><a class="page-link" href="#">Next</a></li>\n`;
        }

        $("table tbody").html(html);
        $('nav ul').html(pagination);
    })
        .fail(function (err) {
            $("#notFoundModal").modal('show');
            console.log('Data yang diminta tidak ditemukan')
        });
}

// ==================== Add ======================================
const addData = (stringdata, integerdata, floatdata, datedata, booleandata) => {
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/api/",
        data: { stringdata, integerdata, floatdata, datedata, booleandata },
        dataType: 'json'
    }).done(() => {
        loadData();
    })
        .fail((err) => {
            console.log("gagal-add")
        });
    $('#addForm').trigger('reset');
}

// ==================== Delete ======================================
const deleteData = (id) => {
    $.ajax({
        method: "DELETE",
        url: "http://localhost:3000/api/" + id,
        dataType: 'json'
    })
        .done(() => {
            loadData();
        })
        .fail((err) => {
            console.log('error delete');
        })
}

// ===================== Edit (PUT)===================================
const editData = (id, stringdata, integerdata, floatdata, datedata, booleandata) => {
    $.ajax({
        method: "PUT",
        url: "http://localhost:3000/api/" + id,
        data: { stringdata, integerdata, floatdata, datedata, booleandata },
        dataType: 'json'
    }).done(() => {
        loadData();
    })
        .fail((err) => {
            console.log("gagal-edit")
        });
}

// =================== Edit (GET), show data in edit-modal ==============
const dataModal = id => {
    $.ajax({
        method: 'GET',
        url: `http://localhost:3000/api/` + id,
        dataType: 'json'
    })
        .done(result => {
            // console.log(result);
            let html = '';
            let item = result.data;
            $('#editId').val(item.id);
            $('#editString').val(item.stringdata);
            $('#editInteger').val(item.integerdata);
            $('#editFloat').val(item.floatdata);
            $('#editDate').val(moment(item.datedata).format('YYYY-MM-DD'));

            if (item.booleandata == true) {
                html += `<option value="true" selected>true</option>
                            <option value="false">false</option>`;
            } else {
                html += `<option value="false" selected>false</option>
                <option value="true">true</option>`;
            };
            $('#editBoolean').html(html);
        })
        .fail(() => {
            console.log('edit-data gagal');
        })

};
