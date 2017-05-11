/**
 * Republishing List
 * 
 * @namespace Ixxus
 * @class Ixxus.RepublishingList
 */
(function()
{
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event, KeyListener = YAHOO.util.KeyListener, Selector = YAHOO.util.Selector;

	if (typeof Ixxus === "undefined")
	{
		window.Ixxus = {};
	}

	
	Ixxus.RepublishingList = function RepublishingList_constructor(htmlId)
	{
		Ixxus.RepublishingList.superclass.constructor.call(this, "Ixxus.RepublishingList", htmlId, [ "button", "container", "datasource", "datatable", "paginator", "animation" ]);

		return this;
	};

	YAHOO.extend(Ixxus.RepublishingList, Alfresco.component.Base, {	
		/**
		 * Object container for initialization options
		 * 
		 * @property options
		 * @type object
		 */
		options : {
			/**
			 * Maximum number of books to display per page.
			 * 
			 * @property pageSize
			 * @type int
			 * @default 15
			 */
			pageSize : 15
		},
		/**
		 * Number of search results.
		 */
		resultsCount : 0,

		/**
		 * Current visible page index - counts from 1
		 */
		currentPage : 1,
		
		selectedItems : {},
		
		nrOfSelected : 0,
		
		/**
		 * Fired by YUI when parent element is available for scripting
		 * 
		 * @method onReady
		 */
		onReady : function RL_onReady()
		{
			var me = this;
			this._setupDataTable();
			this.widgets.dataTable.setAttributes({width:"100%"},true); 
			this.widgets.republishButton = Alfresco.util.createYUIButton(this, "republish-button", this.onRepublishClick);
		},
		
		onRepublishClick : function RL_onRepublishClick(){
			if (this.nrOfSelected < 1){
                Alfresco.util.PopupManager.displayMessage({
                    text : this.msg("message.republish.no.isbn.selected"),
                	displayTime: 2,
                 });
			} else {
				var isbnList = "";
				
				for (key in this.selectedItems){
					if (this.selectedItems[key] === true){
						isbnList += key + ", ";
					}
				}
				isbnList = isbnList.substring(0, isbnList.lastIndexOf(","));
				//TODO Action URL for the republish
				var actionUrl = YAHOO.lang.substitute(Alfresco.constants.PROXY_URI + "bopp/publishMultipleIsbnToDarts?isbnList={isbnList}", {
					isbnList : isbnList
				});
				var externalWindow = window;
				var republishDialog = new Alfresco.module.SimpleDialog(this.id + "-republish");
				republishDialog.setOptions({
					width : "40em",
					templateUrl : YAHOO.lang.substitute(Alfresco.constants.URL_PAGECONTEXT + "components/republishing-list/republishing-dialog?htmlid={id}&isbnList={isbnList}", {
						id : this.id + "-republish",
						isbnList : isbnList
					}),
					actionUrl : actionUrl,
					destroyOnHide : true,
					onSuccess : {
						fn : function dlA_onActionRepublishSucces_success(response)
						{
							Alfresco.util.PopupManager.displayMessage({
								text : this.msg(response.publish.multuple.success.msg)
							});
							externalWindow.location.reload();

						},
						scope : this
					},
					onFailure : {
						fn : function onActionRepublishSucces_failure(response)
						{
							Alfresco.util.PopupManager.displayMessage({
								text : this.msg(response.publish.multuple.failure.msg)
							});
							externalWindow.location.reload();
						},
						scope : this
					}
				}).show();

			}
		},
		
		
		/**
		 * DataTable definition and setup
		 * 
		 * @method _setupDataTable
		 */
		_setupDataTable : function RL_setupDataTable()
		{
			var me = this;
			
			var renderCellSelection = function DataGrid_renderCellSelected(elCell, oRecord, oColumn, oData)
			{
				Dom.setStyle(elCell, "width", oColumn.width + "px");
				Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

				elCell.innerHTML = '<input id="checkbox-' + oRecord.getId() + '" type="checkbox" name="fileChecked" value="' + oData + '"'
						+ (me.selectedItems[oData] ? ' checked="checked">' : '>');
			};

			// DataTable Cell Renderers definitions
			var renderCellModificationDate = function ConsoleTagManagement_onReady_renderCellModificationDate(elCell, oRecord, oColumn, oData)
			{
				var lastUpdatedDate = oRecord.getData().lastUpdated;
				var messageDesc = '<span>' + lastUpdatedDate + '</span>';
				elCell.innerHTML = messageDesc;
			};
			
			var renderCellText = function DataGrid_onReady_renderCellText(elCell, oRecord, oColumn, oData)
			{
				var messageDesc = '<span>' + oData + '</span>';
				elCell.innerHTML = messageDesc;
			};


			// DataSource definition
			this.widgets.dataSource = new YAHOO.util.DataSource(Alfresco.constants.PROXY_URI + "bopp/republishing-list");
			this.widgets.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
			this.widgets.dataSource.connXhrMode = "queueRequests";
			this.widgets.dataSource.responseSchema = {
				resultsList : "items"
			};

			// YUI Paginator definition
			this.widgets.paginator = new YAHOO.widget.Paginator({
				containers : this.id + "-paginator",
				rowsPerPage : this.options.pageSize,
				initialPage : 1,
				template : this.msg("pagination.template"),
				pageReportTemplate : this.msg("pagination.template.page-report"),
				previousPageLinkLabel : this.msg("pagination.previousPageLinkLabel"),
				nextPageLinkLabel : this.msg("pagination.nextPageLinkLabel")
			});

			// DataTable column defintions
			var columnDefinitions = [ {
				key : "isbn",
				label : "Select",
				sortable : false,
				formatter : renderCellSelection,
			} ];

			columnDefinitions.push({
				key : "isbn",
				label : "ISBN",
				sortable : false,
				formatter : renderCellText,
			});
			
			columnDefinitions.push({
				key : "bookTitle",
				label : "Book Title",
				sortable : false,
				formatter : renderCellText,
			});

			columnDefinitions.push({
				key : "subject",
				label : "Subject",
				sortable : false,
				formatter : renderCellText,
			});

			columnDefinitions.push({
				key : "lastUpdated",
				label : "Last Updated",
				sortable : false,
				formatter : renderCellModificationDate,
			});

			// DataTable definition
			this.widgets.dataTable = new YAHOO.widget.DataTable(this.id + "-grid", columnDefinitions, this.widgets.dataSource, {
				renderLoopSize : Alfresco.util.RENDERLOOPSIZE,
				paginator : this.widgets.paginator,
				MSG_EMPTY : this.msg("message.empty")
			});

			// Override abstract function within DataTable to set custom error
			// message
			this.widgets.dataTable.doBeforeLoadData = function Search_doBeforeLoadData(sRequest, oResponse, oPayload)
			{
				if (oResponse.error)
				{
					try
					{
						var response = YAHOO.lang.JSON.parse(oResponse.responseText);
						me.widgets.dataTable.set("MSG_ERROR", response.message);
					} catch (e)
					{
						me._setDefaultDataTableErrors(me.widgets.dataTable);
					}
				}
				else if (oResponse.results)
				{
					// clear the empty error message
					me.widgets.dataTable.set("MSG_EMPTY", "");

					// update the results count, update hasMoreResults.
					me.hasMoreResults = (oResponse.results.length > me.options.maxSearchResults);
					if (me.hasMoreResults)
					{
						oResponse.results = oResponse.results.slice(0, me.options.maxSearchResults);
					}
					me.resultsCount = oResponse.results.length;
				}

				return true;
			};

			// Paginator event handler
			this.widgets.paginator.subscribe("changeRequest", function(state, scope)
			{
				scope.currentPage = state.page;
				scope.widgets.paginator.setState(state);
			}, this);

			// Rendering complete event handler
			this.widgets.dataTable.subscribe("renderEvent", function()
			{
				// Update the paginator
				me.widgets.paginator.setState({
					page : me.currentPage,
					totalRecords : me.resultsCount
				});
				me.widgets.paginator.render();
			});
			
			// File checked handler
			this.widgets.dataTable.subscribe("checkboxClickEvent", function(e)
			{
				var id = e.target.value;
				this.selectedItems[id] = e.target.checked;
				if (e.target.checked === true){
					this.nrOfSelected ++;
				} else {
					this.nrOfSelected --;
				}
			}, this, true);
		},
	});
})();