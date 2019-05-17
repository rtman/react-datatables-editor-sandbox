import React from 'react';
import $ from 'jquery';
import { data } from './Data'
import 'datatables.net-dt/css/jquery.dataTables.min.css'
import 'datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.min.css'
import 'datatables.net-editor-dt/css/editor.dataTables.min.css'
import 'datatables.net-select-dt/css/select.dataTables.min.css'
import 'datatables.net-buttons-dt/css/buttons.dataTables.min.css'
import 'datatables.net-keytable-dt/css/keyTable.dataTables.min.css'
require('datatables.net');
require('datatables.net-fixedcolumns');
require('datatables.net-scrollresize'); // local dependency made my me
require('datatables.net-buttons');
require('datatables.net-buttons/js/buttons.print.min.js');
require('datatables.net-keytable');
require('datatables.net-select');
require('datatables.net-editor')

// console.log('$', $);
// console.log('$.fn',$.fn);
// console.log('$.fn.dataTable', $.fn.dataTable);
// console.log('$.fn.dataTable.Editor',$.fn.dataTable.Editor);

// var editor;

export default class DataTable extends React.Component {
    constructor(props) {
        super(props);
        this.dataTable = null;
        this.editor = null;
        this.isMobile = true
    }
    componentDidMount() {
        // console.log('DataTableEditor - data', data)
        this.$el = $(this.el);
        var editableCols = [5,6]
        this.editor = new $.fn.dataTable.Editor({
            // ajax: "../php/staff.php",
            // table: "#example",
            idSrc: 'id',
            table: this.$el,
            attr: {
                autocomplete: 'off'
            },
            fields: [
                { label: "Name", name: "name"},
                { label: "Category", name: "category"},
                { label: "Size", name: "size"},
                { label: "Price", name: "price"},
                { label: "Par", name: "par"},
                { label: "On Hand", name: "on hand", attr: { type: 'number'}},
                { label: "To Order", name: "to order",attr: { type: 'number'}}
            ]
        });
        this.dataTable = this.$el.DataTable({
            data: data,
            columns: [
            {data: "name", title: "Name"},
            {data: "category", title: "Category"},
            {data: "size", title: "Size"},
            {data: "price", title: "Price"},
            {data: "par", title: "Par"},
            {data: "on hand", title: "On Hand", className: 'editable'},
            {data: "to order", title: "To Order", className: 'editable'}
            ],
            // buttons: [
            //     { extend: 'create', editor: this.editor },
            //     { extend: 'edit', editor: this.editor },
            //     { extend: 'remove', editor: this.editor }
            // ],
            // buttons: ['copy', 'csv', 'excel'],
            // buttons: true,
            scrollResize: true,
            dom: 'rt', // https://datatables.net/reference/option/dom
            paging: false,
            scrollX: true,
            scrollY: 100,
            scrollCollapse: false,
            fixedColumns: true,
            autoWidth: false,
            // rowId: 'id',
            keys: {
                columns: editableCols,
                editor: this.editor
                // editorKey: 'tab-only' // should disable cell movement when edit by return
            },
            // select: true
            select: {
                style: 'single',
                selector: 'td:first-child'
                // blurable: true
            },
            // info: false
            // search: false,
            // fixedHeader: true,
            // orderCellsTop: true
        });
        // console.log('DataTableEditor - editor',this.editor);
        // console.log('DataTableEditor - this.dataTable',this.dataTable);

        this.$el.on('key-focus', (e, datatable, cell) => {
            console.log('DataTableEditor - key-focus event');
            this.dataTable.row(cell.index().row).select();
        });

        // issue is between keys option and this
        this.$el.on(
            'click',
            // 'dblclick',
            // 'tbody td:not(:first-child)',
            'tbody td.editable',
            (e) => {
                this.editor.inline(e.target, {onBlur: 'submit'});
            }
        );
        $(this.editor).on('open', (e, mode, action) => {
            // if (mode === 'inline') {
                console.log('DataTableEditor - inline editor on open event');
                $(this.editor).on('postEdit', () => {

                    console.log('DataTableEditor - inline editor postEdit event')
                    let rowIndexes = this.dataTable.rows( { order: 'applied' } ).indexes()
                    // let colIndexes = this.dataTable.columns( { order: 'applied' } ).indexes()
                    let thisCell = this.dataTable.cell( { focused: true } )
                    // console.log('DataTableEditor - thisCell', thisCell.node())
                    // console.log('DataTableEditor - rowIndexes', rowIndexes)
                    // console.log('DataTableEditor - columnIndexes', columnIndexes)
                    console.log('DataTableEditor - postEdit - thisCell.any()', thisCell.any())
                    if (thisCell.any()) {
                        let thisRowIdx = thisCell.index().row
                        let thisColIdx = thisCell.index().column
                        let indexInRowIndexes = rowIndexes.indexOf(thisRowIdx)
                        let indexInColIndexes = editableCols.indexOf(thisColIdx)
                        console.log('DataTableEditor - postEdit - thisRowIdx', thisRowIdx)
                        console.log('DataTableEditor - postEdit - thisColIdx', thisColIdx)
                        // console.log('DataTableEditor - indexInRowIndexes', indexInRowIndexes)
                        let nextRowIdx
                        let nextColIdx
                        if (rowIndexes[indexInRowIndexes + 1] !== undefined) {
                            nextRowIdx = rowIndexes[indexInRowIndexes + 1];
                            nextColIdx = thisColIdx;
                        } else {
                            nextRowIdx = rowIndexes[0];
                            if (
                                editableCols[
                                    indexInColIndexes + 1
                                ] !== undefined
                            ) {
                                nextColIdx = editableCols[
                                    indexInColIndexes + 1
                                ];
                            } else {
                                nextColIdx = editableCols[0];
                            }
                        }

                        console.log('DataTableEditor - nextRowIdx', nextRowIdx)
                        console.log('DataTableEditor - nextColIdx', nextColIdx)
                        let nextCell = this.dataTable.cell({row: nextRowIdx, column: nextColIdx})
                        // console.log('DataTableEditor - nextCell', nextCell.node())
                        if (nextCell.length) {
                            let nextCellNode = $(nextCell.node())
                            // console.log('DataTableEditor - nextCellNode', nextCellNode)

                            // the two lines affect the behaviour in question, alternate them to see
                            // this.dataTable.cell($(this.dataTable.cell({row: rowIndexes[indexInRowIndexes], column: nextColIdx}).node())).focus();
                            this.dataTable.cell(nextCellNode).focus();

                            if(true)
                            this.editor.inline(nextCellNode, {onBlur: 'submit'});

                        }

                    }
                });
            // }
        });
        $(this.editor).on('close', () => {
            console.log('Listener Close event ') 
            $(this.editor).off('postEdit')
            console.log('Listener PostEdit Off ') 
        })

        // $(this.editor).on('postSubmit.editorInline', (e,mode,action) => {
        //     console.log('DataTableEditor - inline editor post edit event')
        //     var rowsCurrentOrder = this.dataTable.rows( { order:'display' } ).ids();
        //     var editRowIdx = rowsCurrentOrder.indexOf( this.editor.ids()[0] );
        //     var nextRowId = rowsCurrentOrder[ editRowIdx + 1 ];
             
        //     $(this.editor).on( 'close', () =>{
        //         console.log('DataTableEditor - inline editor close event')
        //         this.editor.inline( nextRowId );
        //     } );
        // })
    }

    componentWillUnmount() {
        console.log('DataTableEditor - componentWillUnmount');
        this.dataTable.destroy(true);
    }

    componentDidUpdate(prevProps) {
        console.log('DataTableEditor - componentDidUpdate - prevProps',prevProps);
        console.log(
            'DataTableEditor - componentDidUpdate - this.props', this.props
        );
    }

    shouldComponentUpdate() {
        console.log('DataTableEditor - shouldComponentUpdate');
        return false;
    }

    search = (value) => {
        this.dataTable.search(value).draw();
    };

    render() {
        return <table ref={(el) => (this.el = el)} />;
    }
}