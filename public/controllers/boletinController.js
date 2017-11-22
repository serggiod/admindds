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

        // i:Guardar Nuevo.
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
        // f:Guardar Nuevo.

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
                            $scope.btnClose = true;
                            $scope.formularios.formulario.display = true;
                            $scope.loading = false;
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
                            $scope.modelo = json.rows;
                            $scope.displayReset();
                            $scope.loading = false;
                            $scope.readonly = true;
                            $scope.disabled = true;
                            $scope.disabledHeader = true;
                            $scope.disabledObserv = true;
                            $scope.disableSesion = true;
                            $scope.visualizar = true;
                            $scope.btnClose = true;
                            $scope.display = false;
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
            alert('Imprimir archivo en pdf.');
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
            console.log(url);
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