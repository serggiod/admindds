angular
    .module('legapp')
    .controller('boletinController', function($scope, $rootScope, $http, $session, $document) {

        $scope.init = function() {
            $session.autorize(function() {
                $scope.d = new Date();
                $scope.toolbar = [
                    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
                ];
                $scope.displayReset();
                $scope.modeloReset();
                $scope.getPeriodos();
                $scope.getLista();
            });
        };

        $scope.displayReset = function() {
            $scope.display = true;
            $scope.loading = false;
            $scope.disabled = true;
            $scope.disabledObserv = true;
            $scope.disabledHeader = true;
            $scope.disableSesion = true;
            $scope.readonly = false;
            $scope.update = false;
            $scope.visualizar = false;
            $scope.visualizarBtn = false;
            $scope.visualizarBtn = false;
        };

        $scope.modeloReset = function() {
            $scope.modelo = {
                header: {
                    keyPeriodo: 0,
                    keySesion: 0,
                    numero: 1,
                    anio: $scope.d.getFullYear(),
                    sesion: {
                        idsesion: null,
                        nombre: null,
                        numero: null,
                        periodo: null,
                        tipo: null,
                        fecha: {
                            desde: {
                                dia: 1,
                                mes: 1,
                                anio: $scope.d.getFullYear(),
                                hora: 16,
                                minuto: 0,
                                segundo: 0
                            },
                            hasta: {
                                dia: 1,
                                mes: 1,
                                anio: $scope.d.getFullYear(),
                                hora: 20,
                                minuto: 0,
                                segundo: 0
                            }
                        }
                    },
                    fecha: {
                        desde: new Date($scope.d.getTime() - (5 * 24 * 3600 * 1000)),
                        hasta: $scope.d
                    },
                    observaciones: null
                },
                body: {
                    sancion: {
                        leyes: [],
                        resoluciones: [],
                        declaraciones: []
                    }
                }
            };
            $scope.formulario = {
                id:null,
                numero:'',
                expediente:'',
                tema:'',
                autores:'',
                observaciones:'',
                agregado:true,
                tipo:null
            };
            $scope.sesionesLegislativas = null;
        };

        $scope.showDanger  = function(message, callback) { $scope.showModal(message, callback, '!', BootstrapDialog.TYPE_DANGER); };

        $scope.showSuccess = function(message, callback) { $scope.showModal(message, callback, '!', BootstrapDialog.TYPE_SUCCESS); };

        $scope.showWarning = function(message, callback) { $scope.showModal(message, callback, '!', BootstrapDialog.TYPE_WARNING); };

        $scope.showConfirm = function(message, callback, bool) { $scope.showModal(message, callback, 'CONFIRMAR', BootstrapDialog.TYPE_PRIMARY,bool); };

        $scope.showModal   = function(message, callback, title, type, bool) {

            var cssClass = null;
            if(type===BootstrapDialog.TYPE_DANGER)  cssClass = 'btn btn-danger';
            if(type===BootstrapDialog.TYPE_SUCCESS) cssClass = 'btn btn-success';
            if(type===BootstrapDialog.TYPE_WARNING) cssClass = 'btn btn-warning';
            if(type===BootstrapDialog.TYPE_PRIMARY) cssClass = 'btn btn-primary';
            
            var buttons = [];
            if(bool===true) cssClass = 'btn btn-danger';
            if(type===BootstrapDialog.TYPE_PRIMARY){
                buttons.push({
                    icon: 'btnCancel',
                    cssClass: cssClass,
                    icon: 'glyphicon glyphicon-remove-circle',
                    label: 'Cancelar',
                    action: function(modal) {
                        modal.close();
                        delete modal;
                    }
                });
            }
            buttons.push({
                id: 'btnOk',
                cssClass: cssClass,
                icon: 'glyphicon glyphicon-ok-circle',
                label: 'Aceptar'
            });
            
            if(bool===true) type = BootstrapDialog.TYPE_DANGER;
            var modal = BootstrapDialog.show({
                closable: false,
                type: type,
                size: BootstrapDialog.SIZE_SMALL,
                title: title,
                message: message,
                buttons: buttons
            });

            var btnOk = modal.getButton('btnOk');
            btnOk.click(function(){
                if(typeof(callback)==='function') callback();
                modal.close();
                delete modal;
            });

        };

        $scope.error404 = function(){
            $scope.showWarning('Consulte en el Centro de Computos.', function() {
                $scope.loading = false;
                $scope.$apply();
            });
        };

        $scope.getLista = function() {
            $session.autorize(function() {
                $scope.loading = true;
                uri = '/rest/ful/admindds/index.php/boletines';
                $http
                    .get(uri)
                    .error(function() { $scope.error404(); })
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.lista = json.rows;
                            $scope.displayReset();
                            $scope.display = true;
                            $scope.loading = false;
                        }
                    });
            });
        };

        $scope.getPeriodos = function() {
            $scope.loading = true;
            url = '/rest/ful/admindds/index.php/periodos-legislativos';
            $http
                .get(url)
                .error(function() { $scope.error404(); })
                .success(function(json) {
                    if (json.result === true) {
                        $scope.periodosLegislativos = json.rows;
                        $scope.loading = false;
                    }
                });
        };

        $scope.getSesiones = function(periodo) {
            $scope.loading = true;
            url = '/rest/ful/admindds/index.php/periodo-legislativo/' + periodo + '/sesiones';
            $http
                .get(url)
                .error(function() { $scope.error404(); })
                .success(function(json) {
                    if (json.result === true) {
                        $scope.sesionesLegislativas = $scope.deleteUsedSesions(json.rows);
                        $scope.loading = false;
                    }
                })
        };

        $scope.deleteUsedSesions = function(json){
            var periodo = $scope.periodosLegislativos[$scope.modelo.header.keyPeriodo].nombre;
            var anio = $scope.periodosLegislativos[$scope.modelo.header.keyPeriodo].anio;
            var jsonExists = [];
            for(var i in $scope.lista) if($scope.lista[i].periodo===periodo) jsonExists.push($scope.lista[i]); 
            for(var x in jsonExists){
                for(var i in json) if((json[i].sesion===jsonExists[x].sesion)&&(json[i].tipo===jsonExists[x].tipo)) json.splice(i,1);
            }
            return json;
        };

        $scope.getModelBodySanciones = function() {
            $session.autorize(function() {
                $http
                    .get(url)
                    .error(function() { $scope.error404(); })
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.modelo.body.sancion.leyes = json.rows.sancion.leyes;
                            $scope.modelo.body.sancion.resoluciones = json.rows.sancion.resoluciones;
                            $scope.modelo.body.sancion.declaraciones = json.rows.sancion.declaraciones;
                            $scope.loading = false;
                        }
                    });
            });
            $scope.loading = true;
            url = '/rest/ful/admindds/index.php/sancion/' + $scope.id;
        };

        $scope.getModelToPdf = function(k) {
            $scope.id = $scope.lista[k].id;
            $session.autorize(function() {

                var pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });

                var specialElementHandlers = {
                    '#diffoutput': function(element, renderer) {
                        return true;
                    }
                };

                var options = {
                    pagesplit: true
                };

                var html = '';
                html += '<div class="text-center">';
                html += 'Aguarde un instante se esta generando el archivo pdf.';
                html += '<div class="progress">';
                html += '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">';
                html += '</div>';
                html += '</div>';
                html += '</div>';

                var d = BootstrapDialog.show({
                    closable: false,
                    title: 'Exportar a PDF',
                    message: html,
                    buttons: [{
                        id: 'btnErr',
                        cssClass: 'btn btn-danger',
                        label: 'Cancelar',
                        action: function() {
                            d.close();
                            html = null;
                        }
                    }, {
                        id: 'btnOk',
                        cssClass: 'btn btn-primary',
                        label: 'Imprimir',
                        enabled: false,
                        action: function() {
                            //pdf.output('dataurlnewwindow');
                            pdf.save('datauristring');
                        }
                    }],
                    onshow: function() {
                        var url = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                        $http
                            .get(url)
                            .success(function(json) {
                                if (json.result === true) {
                                    var modelo = json.rows;

                                    // Logo Jujuy.
                                    /*
                                        headerStyles: {
                                            halign: 'center',
                                            valign: 'middle',
                                            columnWidth: 'auto', // 'auto', 'wrap' or a number
                                            cellPadding: 5,
                                            font: "helvetica", // helvetica, times, courier
                                            fontStyle: 'normal', // normal, bold, italic, bolditalic
                                            fontSize: 10,
                                            textColor: '#000000',
                                            fillColor: 255,
                                            fillStyle: 'F', // 'S', 'F' or 'DF' (stroke, fill or fill then stroke)
                                            lineColor: 200,
                                            lineWidth: 0.1,
                                            overflow: 'ellipsize' // visible, hidden, ellipsize or linebreak
                                        },
                                        bodyStyles: {},
                                        columnStyles: {},
                                        tableWidth: 'auto',
                                        styles: {
                                            rowHeight: 120,
                                            cellPadding: 0.5,
                                            fontSize: 8,
                                            textAlign: 'center'
                                        },
                                     */
                                    pdf.autoTable(['', '', ''], [], {
                                        headerStyles: {
                                            textColor: '#000000',
                                            halign: 'center',
                                            valign: 'middle'
                                        },
                                        drawHeaderCell: function(cell, data) {
                                            cell.height = 30;
                                            if (data.column.index === 0) {

                                            }
                                            if (data.column.index === 1) {
                                                cell.styles.fontSize = 15;
                                                cell.text[0] = 'BOLETÍN LEGISLATIVO NRO ' + modelo.header.numero + '/' + modelo.header.anio;
                                                cell.text[1] = 'Semana desde ' + modelo.header.fecha.desde + ' hasta ' + modelo.header.fecha.hasta;
                                                cell.text[2] = 'Actividad Parlamentaria';
                                            }
                                            if (data.column.index === 2) {

                                            }
                                        }
                                    });

                                    pdf.addImage(jujuypng, 'png', 8, 5, 19, 17);
                                    pdf.addImage(argentinapng, 'png', 180, 3, 22, 27);

                                    // Encsabezado.
                                    /*titulo = 'BOLETÍN LEGISLATIVO NRO ' + modelo.header.numero + '/' + modelo.header.anio + '\n';
                                    titulo += 'Semana desde' + modelo.header.fecha.desde + 'hasta' + modelo.header.fecha.hasta + '\n';
                                    titulo += '\n';
                                    titulo += 'Actividad Parlamentaria';
                                    var columns = ["", "", ""];
                                    var rows = [
                                        ['', titulo, '']
                                    ];
                                    // Only pt supported (not mm or in) 
                                    pdf.autoTable(columns, rows);*/
                                    var btnOk = d.getButton('btnOk');
                                    btnOk.enable();
                                    //btnOk.click();
                                    /*var canvas = pdf.canvas;
                                    canvas.pdf = pdf;
                                    /*pdf.annotations = {
                                        _nameMap: [],
                                        createAnnotation: function(href, bounds) {
                                            var x = pdf.context2d._wrapX(bounds.left);
                                            var y = pdf.context2d._wrapY(bounds.top);
                                            var page = pdf.context2d._page(bounds.top);
                                            var options;
                                            var index = href.indexOf('#');
                                            if (index >= 0) {
                                                options = {
                                                    name: href.substring(index + 1)
                                                };
                                            } else {
                                                options = {
                                                    url: href
                                                };
                                            }
                                            pdf.link(x, y, bounds.right - bounds.left, bounds.bottom - bounds.top, options);
                                        },
                                        setName: function(name, bounds) {
                                            var x = pdf.context2d._wrapX(bounds.left);
                                            var y = pdf.context2d._wrapY(bounds.top);
                                            var page = pdf.context2d._page(bounds.top);
                                            this._nameMap[name] = {
                                                page: page,
                                                x: x,
                                                y: y
                                            };
                                        }
                                    };
                                    canvas.annotations = pdf.annotations;
                                    pdf.context2d._pageBreakAt = function(y) {
                                        this.pageBreaks.push(y);
                                    };
                                    pdf.context2d._gotoPage = function(pageOneBased) {
                                        while (pdf.internal.getNumberOfPages() < pageOneBased) {
                                            pdf.addPage();
                                        }
                                        pdf.setPage(pageOneBased);
                                    };*/

                                    /*var div = document.createElement('div');
                                    div.id = 'htmlToPDF';
                                    div.style.color = '#000';
                                    div.style.background = '#FFF';
                                    div.style.fontSize = '14px';

                                    var enc = document.createElement('table');
                                    var trEnc1 = document.createElement('tr');
                                    var tdEnc1 = document.createElement('td');
                                    var h3Enc1 = document.createElement('h3');
                                    var trEnc2 = document.createElement('tr');
                                    var tdEnc21 = document.createElement('td');
                                    var tdEnc22 = document.createElement('td');
                                    var tdEnc23 = document.createElement('td');
                                    enc.cssClass = 'table table-striped table-bordered table-hover table-condensed table-responsive text-center';
                                    tdEnc1.colSpan = '3';
                                    h3Enc1.innerHTML = '&nbsp;';
                                    tdEnc1.appendChild(h3Enc1);
                                    trEnc1.appendChild(tdEnc1);
                                    enc.appendChild(trEnc1);
                                    tdEnc22.innerHTML = '<br/><br/>';
                                    tdEnc22.innerHTML += '<h3>BOLETÍN LEGISLATIVO NRO ' + modelo.header.numero + '/' + modelo.header.anio + '</h3>';
                                    tdEnc22.innerHTML += '<h4>Semana desde' + modelo.header.fecha.desde + 'hasta' + modelo.header.fecha.hasta + '</h4>';
                                    tdEnc22.innerHTML += '<br/>';
                                    tdEnc22.innerHTML += '<h4><u>Actividad Parlamentaria</u></h4>';
                                    trEnc2.appendChild(tdEnc21);
                                    trEnc2.appendChild(tdEnc22);
                                    trEnc2.appendChild(tdEnc23);
                                    enc.appendChild(trEnc2);

                                    /*
                                    <!-- Encabezado. -->
                                    <table class="table table-striped table-bordered table-hover table-condensed table-responsive text-center">
                                        <tr>
                                            <td colspan="3">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:300px;">
                                                <br/><br/>
                                                <img src="http://www.legislaturajujuy.gov.ar/imgcdn/jujuy.png" width="100" />
                                                <br/> Legislatura de Jujuy
                                                <br/> Cámara de Diputados
                                                <br/> {{modelo.header.sesion.periodo}}
                                            </td>
                                            <td>
                                                <br/><br/>
                                                <h3>BOLETÍN LEGISLATIVO NRO {{modelo.header.numero}}/{{modelo.header.anio}}</h3>
                                                <h4>Semana desde
                                                    <input style="width:100px;border:0px;background-color:#fff;" name="date" ng-model="modelo.header.fecha.desde" ng-disabled="'trur'" data-date-format="dd/MM/yyyy" data-language="es" data-autoclose="true" type="text" bs-datepicker>                                hasta
                                                    <input style="width:100px;border:0px;background-color:#fff;" name="date" ng-model="modelo.header.fecha.hasta" ng-disabled="'trur'" data-date-format="dd/MM/yyyy" data-language="es" data-autoclose="true" type="text" bs-datepicker>
                                                </h4>
                                                <br/>
                                                <h4><u>Actividad Parlamentaria</u></h4>
                                            </td>
                                            <td style="width:300px;">
                                                <img src="http://www.legislaturajujuy.gov.ar/imgcdn/argentina.png" width="100" /><br/>
                                                <strong>República Argentina</strong>
                                                <br/> Provincia de Jujuy
                                                <br/> San Salvador de Jujuy
                                                <br/> Gorriti 47
                                                <br/> Telefono: 388 4239200
                                            </td>
                                        </tr>
                                    </table>
                                    <table class="table table-striped table-bordered table-hover table-condensed table-responsive text-left">
                                        <tr>
                                            <td>
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <h4>1) SÍNTESIS DE TEMAS IMPORTANTES CONSIDERADOS, APROBADOS Y SANCIONADOS EN LA <span class="text-upper">{{modelo.header.sesion.nombre}}</span> DEL {{modelo.header.sesion.fecha.desde.dia}}-{{modelo.header.sesion.fecha.desde.mes}}-{{modelo.header.sesion.fecha.desde.anio}}.</h4>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- Sesion -->
                                    <table class="table table-striped table-bordered table-hover table-condensed table-responsive text-center" ng-show="modelo.header.sesion.nombre">
                                        <tr>
                                            <td colspan="6">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="6">
                                                <h3>SESIÓN</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:120px;">
                                                <h4><strong>PERIODO</strong></h4>
                                            </td>
                                            <td style="width:120px;">
                                                <h4><strong>AÑO</strong></h4>
                                            </td>
                                            <td>
                                                <h4><strong>SESION Y TIPO</strong></h4>
                                            </td>
                                            <td style="width:150px;">
                                                <h4><strong>FECHA</strong></h4>
                                            </td>
                                            <td style="width:150px;">
                                                <h4><strong>HORAS</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>OBSERVACIONES</strong></h4>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>{{modelo.header.sesion.numero}}</td>
                                            <td>{{modelo.header.sesion.fecha.desde.anio}}</td>
                                            <td>{{modelo.header.sesion.nombre}}</td>
                                            <td>{{modelo.header.sesion.fecha.desde.dia}}-{{modelo.header.sesion.fecha.desde.mes}}-{{modelo.header.sesion.fecha.desde.anio}}</td>
                                            <td>{{modelo.header.sesion.fecha.desde.hora}}:{{modelo.header.sesion.fecha.desde.minuto}}:{{modelo.header.sesion.fecha.desde.segundo}}<br/> {{modelo.header.sesion.fecha.hasta.hora}}:{{modelo.header.sesion.fecha.hasta.minuto}}:{{modelo.header.sesion.fecha.hasta.segundo}}</td>
                                            <td>{{modelo.header.observaciones}}</td>
                                        </tr>
                                    </table>
                                    <!-- Normativas -->
                                    <table class="table table-striped table-bordered table-hover table-condensed table-responsive text-center">
                                        <tr>
                                            <td colspan="5">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5">
                                                <h3>NORMATIVAS APROBADAS Y SANCIONADAS</h3>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- Leyes -->
                                    <table ng-show="modelo.body.sancion.leyes.length" class="table table-striped table-bordered table-hover table-condensed table-responsive text-center">
                                        <tr>
                                            <td colspan="5">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5">
                                                <h3>LEYES</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:80px;">
                                                <h4><strong>Número</strong></h4>
                                            </td>
                                            <td style="width:120px;">
                                                <h4><strong>Expediente</strong></h4>
                                            </td>
                                            <td>
                                                <h4><strong>Tema</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Autores</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Observaciones</strong></h4>
                                            </td>
                                        </tr>
                                        <tr ng-repeat="(k,l) in modelo.body.sancion.leyes">
                                            <td>{{l.numero}}</td>
                                            <td><strong>{{l.expediente}}</strong></td>
                                            <td>{{l.tema}}</td>
                                            <td>{{l.autores}}</td>
                                            <td>{{l.observaciones}}</td>
                                        </tr>
                                    </table>
                                    <!-- Declaraciones. -->
                                    <table ng-show="modelo.body.sancion.resoluciones.length" class="table table-striped table-bordered table-hover table-condensed table-responsive text-center">
                                        <tr>
                                            <td colspan="5">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5">
                                                <h3>RESOLUCIONES</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:80px;">
                                                <h4><strong>Número</strong></h4>
                                            </td>
                                            <td style="width:120px;">
                                                <h4><strong>Expediente</strong></h4>
                                            </td>
                                            <td>
                                                <h4><strong>Tema</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Autores</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Observaciones</strong></h4>
                                            </td>
                                        </tr>
                                        <tr ng-repeat="(k,l) in modelo.body.sancion.resoluciones">
                                            <td>{{l.numero}}</td>
                                            <td><strong>{{l.expediente}}</strong></td>
                                            <td>{{l.tema}}</td>
                                            <td>{{l.autores}}</td>
                                            <td>{{l.observaciones}}</td>
                                        </tr>
                                    </table>
                                    <!-- Declaraciones -->
                                    <table ng-show="modelo.body.sancion.declaraciones.length" class="table table-striped table-bordered table-hover table-condensed table-responsive text-center">
                                        <tr>
                                            <td colspan="5">
                                                <h3>&nbsp;</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5">
                                                <h3>DECLARACIONES</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:80px;">
                                                <h4><strong>Número</strong></h4>
                                            </td>
                                            <td style="width:120px;">
                                                <h4><strong>Expediente</strong></h4>
                                            </td>
                                            <td>
                                                <h4><strong>Tema</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Autores</strong></h4>
                                            </td>
                                            <td style="width:250px;">
                                                <h4><strong>Observaciones</strong></h4>
                                            </td>
                                        </tr>
                                        <tr ng-repeat="(k,l) in modelo.body.sancion.declaraciones">
                                            <td>{{l.numero}}</td>
                                            <td><strong>{{l.expediente}}</strong></td>
                                            <td>{{l.tema}}</td>
                                            <td>{{l.autores}}</td>
                                            <td>{{l.observaciones}}</td>
                                        </tr>
                                    </table>
                                    */
                                    /*div.appendChild(enc);
                                    html = document.body.appendChild(div);

                                    pdf.addHTML(html, function() {
                                        var btnOk = d.getButton('btnOk');
                                        btnOk.enable();
                                    });*/
                                }
                            });
                    }
                });
            });
        };

        $scope.setModelHeaderPeriodo = function() {
            key = $scope.modelo.header.keyPeriodo;
            $scope.modelo.header.sesion.numero = $scope.periodosLegislativos[key].periodo;
            $scope.modelo.header.sesion.periodo = $scope.periodosLegislativos[key].nombre;
            $scope.modelo.header.sesion.fecha.desde.anio = parseInt($scope.periodosLegislativos[key].anio);
            $scope.modelo.header.sesion.fecha.hasta.anio = parseInt($scope.periodosLegislativos[key].anio);
            $scope.getSesiones($scope.modelo.header.sesion.periodo);
        };

        $scope.setModelHeaderSesion = function() {
            $scope.loading = true;
            key = $scope.modelo.header.keySesion;
            $scope.modelo.header.sesion.nombre = $scope.sesionesLegislativas[key].sesion;
            $scope.modelo.header.sesion.tipo = $scope.sesionesLegislativas[key].tipo;
            $scope.modelo.header.sesion.fecha.desde.dia = parseInt($scope.sesionesLegislativas[key].fecha.substring(0, 2));
            $scope.modelo.header.sesion.fecha.hasta.dia = parseInt($scope.sesionesLegislativas[key].fecha.substring(0, 2));
            $scope.modelo.header.sesion.fecha.desde.mes = parseInt($scope.sesionesLegislativas[key].fecha.substring(3, 5));
            $scope.modelo.header.sesion.fecha.hasta.mes = parseInt($scope.sesionesLegislativas[key].fecha.substring(3, 5));
            $scope.modelo.body.sancion.leyes = [];
            $scope.modelo.body.sancion.resoluciones = [];
            $scope.modelo.body.sancion.declaraciones = [];
            url = '/rest/ful/admindds/index.php/sesion';
            url += '/' + $scope.modelo.header.sesion.nombre;
            url += '/' + $scope.modelo.header.sesion.tipo;
            url += '/' + $scope.modelo.header.sesion.fecha.desde.anio + '-' + $scope.modelo.header.sesion.fecha.desde.mes + '-' + $scope.modelo.header.sesion.fecha.desde.dia;
            $http
                .get(url)
                .error(function() { $scope.error404(); })
                .success(function(json) {
                    if (json.result === true) {
                        $scope.modelo.header.sesion.idsesion = json.rows.idsesion;
                        $scope.modelo.header.observaciones = json.rows.observaciones;
                        $scope.modelo.header.sesion.fecha.desde.hora = parseInt(json.rows.hora);
                        $scope.modelo.header.sesion.fecha.desde.minuto = parseInt(json.rows.minutos);
                        $scope.disabled = false;
                        $scope.disabledObserv = false;
                        $scope.disabledHeader = false;
                        $scope.loading = false;
                    }
                });
        };

        $scope.setModelHeaderCheckSession = function() {
            if ($scope.modelo.header.sesion.periodo != null) {
                if ($scope.modelo.header.sesion.nombre != null) return true;
                else return false;
            } else return false;
        };

        $scope.setModelHeaderCheckBoletinExists = function(){
            if ($scope.setModelHeaderCheckSession()) {
                $scope.loading = true;
                var uri = '/rest/ful/admindds/index.php/boletin/check/boletin/' + $scope.modelo.header.numero;
                $http
                    .get(uri)
                    .error($scope.error404)
                    .success(function(json){
                        $scope.loading = false;
                        if(json.result===true)  $scope.showDanger(json.rows);
                        if(json.result===false) $scope.setModelHeaderCheckSesionExists();
                    });
            } else $scope.showDanger('Los campos \'PERIODO LEGISLATIVO\' y \'SESION Nº Y TIPO\' son obligatorios.');
        };

        $scope.setModelHeaderCheckSesionExists = function(){
            $scope.loading = true;
            var uri = '/rest/ful/admindds/index.php/boletin/check/sesion/' + $scope.modelo.header.sesion.idsesion;
            $http
                .get(uri)
                .error($scope.error404)
                .success(function(json){
                    $scope.loading = false;
                    if(json.result===true)  $scope.showDanger(json.rows);
                    if(json.result===false) $scope.setModelSave();
                });
        };

        $scope.setModelSave = function(){
            if ($scope.setModelHeaderCheckSession()) {
                $session.autorize(function(){
                    $scope.loading = true;
                    $scope.btnClose = false;
                    var uri = '/rest/ful/admindds/index.php/boletin';
                    $http
                        .post(uri, $scope.modelo)
                        .error($scope.error404)
                        .success(function(json) {
                            $scope.loading = false;
                            if (json.result === false) $scope.showDanger(json.rows);
                            if (json.result === true) {
                                $scope.showSuccess('El boletin se guardo correctamente.', function() {
                                    $scope.id = json.rows;
                                    $scope.disabled = true;
                                    $scope.update = true;
                                    $scope.disabledHeader = true;
                                    $scope.disabledObserv = false;
                                    $scope.getModelBodySanciones();
                                });
                            }
                            $scope.loading = false;
                        });
                });
            } else $scope.showDanger('Los campos \'PERIODO LEGISLATIVO\' y \'SESION Nº Y TIPO\' son obligatorios.');
        };

        $scope.setModelHeaderSesionSave = function() {
            if ($scope.setModelHeaderCheckSession()) {
                $session.autorize(function() {
                    $scope.setModelHeaderCheckBoletinExists();
                });
            } else $scope.showDanger('Los campos \'PERIODO LEGISLATIVO\' y \'SESION Nº Y TIPO\' son obligatorios.');
        };

        $scope.setModelHeaderSesionUpdate = function() {
            if ($scope.setModelHeaderCheckSession()) {
                $session.autorize(function() {
                    $scope.loading = true;
                    uri = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                    $http
                        .put(uri, $scope.modelo)
                        .error(function() { $scope.error404(); })
                        .success(function(json){ if(json.result===true){
                            $scope.showSuccess(json.rows,function(){
                                $scope.getModelBodySanciones();
                                $scope.disabled = true;
                                $scope.update = true;
                                $scope.disabledHeader = true;
                                $scope.disabledObserv = false;
                                $scope.loading = false;
                            });
                        }});
                });
            } else $scope.showDanger('Los campos \'PERIODO LEGISLATIVO\' y \'SESION Nº Y TIPO\' son obligatorios.');
        };

        $scope.setModelHeaderSesionCancelA = function() {
            $scope.displayReset();
            $scope.modeloReset();
            $scope.getLista();
            $scope.display = true;
        };

        $scope.setModelHeaderSesionCancelB = function() {
            if ($scope.setModelHeaderCheckSession){
                if ($scope.disabled === false) $scope.showDanger('Primero debe guardar los datos.');
                else {
                    $scope.displayReset();
                    $scope.modeloReset();
                    $scope.getLista();
                    $scope.display = true;
                }
            } else $scope.showDanger('Los campos \'PERIODO LEGISLATIVO\' y \'SESION Nº Y TIPO\' son obligatorios.');
        };

        $scope.setModelHeaderEnableHeader = function() {
            $scope.showConfirm('¿Esta seguro que desea modificar el encabezado de este boletín?',function(){
                $scope.disabledHeader = false;
                $scope.$apply();
            },false);
        };

        $scope.setModelHeaderEnableHeaderReset = function() {
            $scope.showConfirm('¿Esta seguro que desea reiniciar este formulario, la operacion generará un nuevo boletín?',function(){
                url = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                $http
                    .delete(url)
                    .error(function(){ $scope.error404(); })
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.showSuccess('El Boletin se reinicio correctamente.',function(){
                                $scope.formularios.listar.nuevo();
                                $scope.btnClose = false;
                            });
                        }
                    });
            },true);
        };

        $scope.setModelHeaderDesde = function() {
            $scope.modelo.header.fecha.desde = new Date(new Date($scope.modelo.header.fecha.hasta).getTime() - (4 * 24 * 3600 * 1000));
        };

        /* Operaciones de la lista. */
        $scope.nuevo = function() {
            $session.autorize(function() {
                $scope.loading = true;
                url = '/rest/ful/admindds/index.php/boletin/proximo';
                $http
                    .get(url)
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.modeloReset();
                            $scope.displayReset();
                            $scope.modelo.header.numero = json.rows['proximo'];
                            $scope.readonly = false;
                            $scope.disabled = false;
                            $scope.disabledHeader = true;
                            $scope.disabledObserv = true;
                            $scope.disableSesion  = true;
                            $scope.btnClose = true;
                            $scope.loading = false;
                            $scope.display        = false;
                        }
                    });
            });
        };

        $scope.btnVisualizar  = function(k){
            $session.autorize(function() {
                $scope.loading = true;
                $scope.id = $scope.lista[k].id;
                uri = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                $http
                    .get(uri)
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.displayReset();
                            $scope.modelo = json.rows;
                            $scope.readonly       = true;
                            $scope.disabled       = true;
                            $scope.disabledHeader = true;
                            $scope.disabledObserv = true;
                            $scope.disableSesion  = true;
                            $scope.visualizar     = true;
                            $scope.btnClose       = true;
                            $scope.loading        = false;
                            $scope.display        = false;
                        }
                    });


            });
        };

        $scope.btnModificar   = function(k){
            $scope.showConfirm('¿Esta seguro que desea modificar este boletín?',function(){
                $session.autorize(function() {
                    $scope.loading = true;
                    $scope.id = $scope.lista[k].id;
                    uri = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                    $http
                        .get(uri)
                        .success(function(json) {
                            if (json.result === true) {
                                for (var a in $scope.periodosLegislativos) {
                                    if ($scope.periodosLegislativos[a].nombre === json.rows.header.sesion.periodo) {
                                        json.rows.header.keyPeriodo = a;
                                        url = '/rest/ful/admindds/index.php/periodo-legislativo/' + json.rows.header.sesion.periodo + '/sesiones';
                                        $http
                                            .get(url)
                                            .success(function(jsons) {
                                                if (jsons.result === true) {
                                                    $scope.sesionesLegislativas = jsons.rows;
                                                    for (var b in $scope.sesionesLegislativas) {
                                                        if (json.rows.header.sesion.nombre === $scope.sesionesLegislativas[b].sesion) json.rows.header.keySesion = b;
                                                    }
                                                    $scope.modelo = json.rows;
                                                    $scope.displayReset();
                                                    $scope.readonly = false;
                                                    $scope.update = true;
                                                    $scope.disabled = true;
                                                    $scope.disabledHeader = true;
                                                    $scope.disabledObserv = false;
                                                    $scope.disableSesion = true;
                                                    $scope.display = false;
                                                    $scope.loading = false;
                                                    $scope.btnClose = false;
                                                }
                                            })
                                    }
                                }
                            }
                        })
                });
            });
        };

        $scope.btnPdfDownload = function(k){
            $session.autorize(()=>{
                $scope.loading = true;
                $scope.id = $scope.lista[k].id;
                uri = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                $http
                    .get(uri)
                    .success(function(json) {
                        if (json.result === true) {
                            $scope.modelo = json.rows;
                            $scope.loading = false;
                            
                            message = '<div class="progress">';
                            message += '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">';
                            message += '</div>';
                            message += '</div>';
                            message += '<center>Se esta generando el PDF.</center>';
                            
                            var Dialog = BootstrapDialog.show({
                                closable: false,
                                type:BootstrapDialog.TYPE_PRIMARY,
                                size:BootstrapDialog.SIZE_SMALL,
                                title:'AGUARDE UNOS INSTANTES',
                                message:message,
                                onshown:(Dialog)=>{

                                    html  = '';
                                    html += '<style>';
                                    html += '*{font-family:Arial,Sans-Serif;font-size:9pt;color:#000000;}';
                                    html += '.common {width:auto;margin-left:0px; margin-right:0px;}';
                                    html += '.top {height:13px;padding:7px;background-color:#04a5e0;clear:both; overflow:hidden;}';
                                    html += '.top-left  {color:#ffffff; font-size:6pt; font-weight:bold; float:left; }';
                                    html += '.top-right {color:#ffffff; font-size:6pt; font-weight:bold; float:right;}';
                                    html += '.white-space {height:10px;}';
                                    html += 'td {padding:3px; border: 0.5px solid #999999;}';
                                    html += '.table-common {width:100%; border:1px solid #999999; text-align:center; }';
                                    html += '.enc-escds{ width:100px; text-align:center; vertical-align:midddle; }';
                                    html += '.enc-escds-texts { font-size: 5pt; }';
                                    html += '.enc-td1 { border-right: 1px solid #999999;} ';
                                    html += '.enc-td3 { border-left : 1px solid #999999;}';
                                    html += '.enc-escds-main{ width:auto; text-align:center; vertical-align:midddle; }';
                                    html += '.enc-escds-main h1{ font-size: 8pt; font-weight: bold; }';
                                    html += '.enc-escds-main h2{ font-size: 7pt; font-weight: bold; }';
                                    html += '.enc-escds-main h3{ font-size: 6pt; font-weight: normal; }';
                                    html += '.enc-escds-main h4{ font-size: 6pt; font-weight: normal; text-decoration: underline; margin-top:5px;}';
                                    html += '.table-sub-title  { font-size: 6pt; font-weight: bold; }';
                                    html += '.table-column-tr    { background-color:#D2ECF6; }';
                                    html += '.table-column-title { font-size: 6pt; font-weight: bold; }';
                                    html += '.table-column-text  { font-size: 6pt; font-weight: normal; }';
                                    html += '</style>';
                                    html += '<div class="common top"><span class="top-left">DPTO. DIARIO DE SESIONES</span><span class="top-right">BOLETIN LEGISLATIVO ' + $scope.modelo.header.anio + '</span></div>';
                                    html += '<div class="common white-space"></div>';
                        
                                    // Encabezado. 
                                    html += '<div class="common">';
                                    html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                    html += '       <tr>';
                                    html += '           <td class="enc-escds enc-td1">';
                                    html += '               <img width="45" src="data:image/png;base64,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">';
                                    html += '               <span class="enc-escds-texts">';
                                    html += '                   <br/>';
                                    html += '                   <br/>LEGISLATURA DE JUJUY';
                                    html += '                   <br/>CÁMARA DE DIPUTADOS';
                                    html += '                   <br/>' + $scope.modelo.header.sesion.periodo;
                                    html += '               </span>';
                                    html += '           </td>';
                                    html += '           <td class="enc-escds-main">';
                                    html += '               <h1>BOLETÍN LEGISLATIVO </h1>';
                                    html += '               <h2>NRO ' + $scope.modelo.header.numero + '/' + $scope.modelo.header.anio +'</h2>';
                                    html += '               <h3>(Semana desde el ' + $scope.modelo.header.sesion.fecha.desde.dia + ' al ' + $scope.modelo.header.sesion.fecha.hasta.dia + '-' + $scope.modelo.header.sesion.fecha.hasta.mes + '-' + $scope.modelo.header.sesion.fecha.hasta.anio + ')</h3>';
                                    html += '           </td>';
                                    html += '           <td class="enc-escds enc-td3">';
                                    html += '               <img width="40" src="data:image/png;base64,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"><br>';
                                    html += '               <span class="enc-escds-texts">';
                                    html += '                   <br/> REPÚBLICA ARGENTINA';
                                    html += '                   <br/> PROVINCIA DE JUJUY';
                                    html += '                   <br/> San Salvador de Jujuy';
                                    html += '                   <br/> Gorriti 47';
                                    html += '                   <br/> Telefono: 388 4239200';
                                    html += '               </span>';
                                    html += '           </td>';
                                    html += '       </tr>';
                                    html += '   </table>';
                                    html += '</div>';
                                    html += '<div class="common white-space"></div>';
                                    html += '<div class="common">';
                                    html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                    html += '       <tr>';
                                    html += '           <td>';
                                    html += '               <h2 class="table-sub-title">ACTIVIDAD PARLAMENTARIA</h2>';
                                    html += '           </td>';
                                    html += '       </tr>';
                                    html += '   </table>';
                                    html += '</div>';
                                    html += '<div class="common white-space"></div>';
                        
                                    // Sessión.
                                    html += '<div class="common">';
                                    html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                    html += '       <tr>';
                                    html += '           <td bgcolor="#e0e3e5" colspan="6">';
                                    html += '               <h5 class="table-sub-title">SESION</h5>';
                                    html += '           </td>';
                                    html += '       </tr>';
                                    html += '       <tr class="table-column-tr">';
                                    html += '           <td class="table-column-title">PERIODO<br/>LEGISLATIVO</td>';
                                    html += '           <td class="table-column-title">AÑO</td>';
                                    html += '           <td class="table-column-title">SESION<br/>(Nº Y TIPO)</td>';
                                    html += '           <td class="table-column-title">FECHA</td>';
                                    html += '           <td class="table-column-title">HORAS</td>';
                                    html += '           <td class="table-column-title">OBSERVACIONES</td>';
                                    html += '       </tr>';
                                    html += '       <tr>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.sesion.numero + '</td>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.anio + '</td>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.sesion.nombre + '</td>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.sesion.fecha.desde.dia + '-' + $scope.modelo.header.sesion.fecha.desde.mes + '-' + $scope.modelo.header.sesion.fecha.desde.anio + '</td>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.sesion.fecha.desde.hora + ':' + $scope.modelo.header.sesion.fecha.desde.minuto +':' + $scope.modelo.header.sesion.fecha.desde.segundo + '</td>';
                                    html += '           <td class="table-column-text">' + $scope.modelo.header.observaciones + '</td>';
                                    html += '       </tr>';
                                    html += '   </table>';
                                    html += '</div>';
                                    html += '<div class="common white-space"></div>';
                        
                                    // Sanciones.
                                    html += '<div class="common">';
                                    html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                    html += '       <tr bgcolor="#D2ECF6">';
                                    html += '           <td colspan="5">';
                                    html += '           <h2 class="table-sub-title">NORMATIVAS APROBADAS Y SANCIONADAS</h2>';
                                    html += '           </td>';
                                    html += '       </tr>';
                                    html += '   </table>';
                                    html += '</div>';
                                    html += '<div class="common white-space"></div>';

                                    // Leyes".
                                    if($scope.modelo.body.sancion.leyes.length){
                                        html += '<div class="common">';
                                        html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                        html += '       <tr bgcolor="#e0e3e5">';
                                        html += '           <td colspan="5">';
                                        html += '              <h2 class="table-sub-title">LEYES</h2>';
                                        html += '           </td>';
                                        html += '       </tr>';
                                        html += '       <tr class="table-column-tr">';
                                        html += '           <td class="table-column-title"> Número </td>';
                                        html += '           <td class="table-column-title"> Expediente </td>';
                                        html += '           <td class="table-column-title"> Tema </td>';
                                        html += '           <td class="table-column-title"> Autores </td>';
                                        html += '           <td class="table-column-title"> Observaciones </td>';
                                        html += '       </tr>';

                                        for(i=0;i<$scope.modelo.body.sancion.leyes.length;i++){
                                            background = '#ffffff';
                                            if(i%2) background = '#e0e3e5';
                                            html += '    <tr bgcolor="' + background + '">';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.leyes[i].numero +'</td>';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.leyes[i].expediente + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.leyes[i].tema + '</td>';
                                            html += '        <td class="table-column-text" style="text-transform:capitalize;">' + $scope.modelo.body.sancion.leyes[i].autores.toLowerCase() + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.leyes[i].observaciones + '</td>';
                                            html += '    </tr>';
                                        }

                                        html += '   </table>';
                                        html += '</div>';
                                        html += '<div class="common white-space"></div>';
                                    }

                                    // Resoluciones.
                                    if($scope.modelo.body.sancion.resoluciones.length){
                                        html += '<div class="common">';
                                        html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                        html += '       <tr bgcolor="#e0e3e5">';
                                        html += '           <td colspan="5">';
                                        html += '              <h2 class="table-sub-title">RESOLUCIONES</h2>';
                                        html += '           </td>';
                                        html += '       </tr>';
                                        html += '       <tr class="table-column-tr">';
                                        html += '           <td class="table-column-title"> Número </td>';
                                        html += '           <td class="table-column-title"> Expediente </td>';
                                        html += '           <td class="table-column-title"> Tema </td>';
                                        html += '           <td class="table-column-title"> Autores </td>';
                                        html += '           <td class="table-column-title"> Observaciones </td>';
                                        html += '       </tr>';
                                        
                                        for(i=0;i<$scope.modelo.body.sancion.resoluciones.length;i++){
                                            background = '#ffffff';
                                            if(i%2) background = '#e0e3e5';
                                            html += '    <tr bgcolor="' + background + '">';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.resoluciones[i].numero +'</td>';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.resoluciones[i].expediente + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.resoluciones[i].tema + '</td>';
                                            html += '        <td class="table-column-text" style="text-transform:capitalize;">' + $scope.modelo.body.sancion.resoluciones[i].autores.toLowerCase() + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.resoluciones[i].observaciones + '</td>';
                                            html += '    </tr>';
                                        }

                                        html += '   </table>';
                                        html += '</div>';
                                        html += '<div class="common white-space"></div>';
                                    }

                                    // Declaraciones.
                                    if($scope.modelo.body.sancion.declaraciones.length){
                                        html += '<div class="common">';
                                        html += '   <table cellpadding="0" cellspacing="0" class="table-common">';
                                        html += '       <tr bgcolor="#e0e3e5">';
                                        html += '           <td colspan="5">';
                                        html += '              <h2 class="table-sub-title">DECLARACIONES</h2>';
                                        html += '           </td>';
                                        html += '       </tr>';
                                        html += '       <tr class="table-column-tr">';
                                        html += '           <td class="table-column-title"> Número </td>';
                                        html += '           <td class="table-column-title"> Expediente </td>';
                                        html += '           <td class="table-column-title"> Tema </td>';
                                        html += '           <td class="table-column-title"> Autores </td>';
                                        html += '           <td class="table-column-title"> Observaciones </td>';
                                        html += '       </tr>';

                                        for(i=0;i<$scope.modelo.body.sancion.declaraciones.length;i++){
                                            background = '#ffffff';
                                            if(i%2) background = '#e0e3e5';
                                            html += '    <tr bgcolor="' + background + '">';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.declaraciones[i].numero +'</td>';
                                            html += '        <td class="table-column-title">' + $scope.modelo.body.sancion.declaraciones[i].expediente + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.declaraciones[i].tema + '</td>';
                                            html += '        <td class="table-column-text" style="text-transform:capitalize;">' + $scope.modelo.body.sancion.declaraciones[i].autores.toLowerCase() + '</td>';
                                            html += '        <td class="table-column-text">' + $scope.modelo.body.sancion.declaraciones[i].observaciones + '</td>';
                                            html += '    </tr>';
                                        }

                                        html += '   </table>';
                                        html += '</div>';
                                        html += '<div class="common white-space"></div>';
                                    }

                                    // Proceso de impresión en pdf.
                                    url = '/impresora-pdf';
                                    xhr = new XMLHttpRequest();
                                    xhr.open('POST',url,true);
                                    xhr.onreadystatechange = ()=>{
                                        if (xhr.readyState == 4 && xhr.status == 200) {
                                            var href = document.createElement('a');
                                            var filename = 'boletin_legislativo_' + $scope.lista[k].numero + '_' + $scope.lista[k].desde + '.pdf';
                                            href.href = 'data:application/pdf;base64,' + xhr.responseText;
                                            href.style.display = 'none';
                                            href.download = filename;
                                            href.onclick = ()=>{ Dialog.close(); };
                                            document.body.appendChild(href);
                                            href.click();
                                        }
                                    };
                                    xhr.send(html);

                                }
                            });
                        }
                    });
            });
        };

        $scope.btnEliminar    = function(k) {
            $scope.showConfirm('¿Esta seguro que desea eliminar este boletin?',function(){
                $session.autorize(function() {
                    $scope.loading = true;
                    $scope.id = $scope.lista[k].id;
                    uri = '/rest/ful/admindds/index.php/boletin/' + $scope.id;
                    $http
                        .delete(uri)
                        .error(function(){$scope.error404();})
                        .success(function(json){if(json.result === true){
                            $scope.showSuccess('El boletín se eliminó correctamente.',function(){
                                $scope.getLista();
                            });
                        }});
                });
            },true);
        };


        /* Administración de Sanciones */
        $scope.formularioReset = function(){
            $scope.formulario = {
                numero:'',
                expediente:'',
                tema:'',
                autores:'',
                observaciones:'',
                tipo:''
            };
        };

        $scope.sancionAgregadoGuardar = function(tipo,form){
            $scope.formulario.tipo = tipo;
            var url = '/rest/ful/admindds/index.php/sancion-agregado/' + $scope.id;
            $http
                .post(url,$scope.formulario)
                .success((json)=>{
                    if(json.result===false) $scope.showDanger(json.rows,null);
                    if(json.result===true)  $scope.showSuccess('La sanción se guardo en forma correcta.',function(){
                        $scope.formulario.id = json.rows;
                        if($scope.formulario.tipo==='l') $scope.modelo.body.sancion.leyes.push($scope.formulario);
                        if($scope.formulario.tipo==='d') $scope.modelo.body.sancion.declaraciones.push($scope.formulario);
                        if($scope.formulario.tipo==='r') $scope.modelo.body.sancion.resoluciones.push($scope.formulario);
                        $scope.formularioReset();
                        $scope.$apply();
                        $document[0][form].reset();
                    });
                });
            return false;
        };

        $scope.sancionRemover = function(k,t){
            $scope.showConfirm(
                '¿Esta seguro que desea eliminar esta sanción?',
                ()=>{

                    var url;
                    if(t==='l'){
                        if($scope.modelo.body.sancion.leyes[k].agregado===0) url = '/rest/ful/admindds/index.php/sancion/';
                        if($scope.modelo.body.sancion.leyes[k].agregado===1) url = '/rest/ful/admindds/index.php/agregado/';
                        url += $scope.modelo.body.sancion.leyes[k].id;
                    }
                    if(t==='r'){
                        if($scope.modelo.body.sancion.resoluciones[k].agregado===0) url = '/rest/ful/admindds/index.php/sancion/';
                        if($scope.modelo.body.sancion.resoluciones[k].agregado===1) url = '/rest/ful/admindds/index.php/agregado/';
                        url += $scope.modelo.body.sancion.resoluciones[k].id;
                    }
                    if(t==='d'){
                        if($scope.modelo.body.sancion.declaraciones[k].agregado===0) url = '/rest/ful/admindds/index.php/sancion/';
                        if($scope.modelo.body.sancion.declaraciones[k].agregado===1) url = '/rest/ful/admindds/index.php/agregado/';
                        url += $scope.modelo.body.sancion.declaraciones[k].id;
                    }

                    $http
                        .delete(url)
                        .success(()=>{
                            if(t==='l') $scope.modelo.body.sancion.leyes.splice(k,1);
                            if(t==='r') $scope.modelo.body.sancion.resoluciones.splice(k,1);
                            if(t==='d') $scope.modelo.body.sancion.declaraciones.splice(k,1);
                        });
                },
                false
            );
        };

        $scope.sancionActualizar = function(k,t){
            var json = null;
            var url  = '';
            if(t==='l') json = $scope.modelo.body.sancion.leyes[k];
            if(t==='r') json = $scope.modelo.body.sancion.resoluciones[k];
            if(t==='d') json = $scope.modelo.body.sancion.declaraciones[k];
            if(json.agregado==false) url = '/rest/ful/admindds/index.php/sancion/' + json.id;
            if(json.agregado==true)  url = '/rest/ful/admindds/index.php/agregado/' + json.id;
            $http
                .put(url,json)
                .success(function(json){
                    if(json.result===true)  $scope.showSuccess('EL registro se actualizó en forma correcta.',null);
                    if(json.result===false) $scope.showDanger ('El registro no pudo ser actualizado.',null);
                });
            return false;
        };

        $scope.init();

    });
