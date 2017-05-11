YAHOO.util.Event.onDOMReady(function(){
	
	var oldTransitionsOnClick = Alfresco.Transitions.prototype.onClick;
	
	Alfresco.Transitions.prototype.onClick = function TF_Transitions_onClick(e, p_obj){
		oldTransitionsOnClick.call(this,e,p_obj);
		p_obj.set("disabled", false);
	}
});
