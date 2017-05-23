/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package org.acme.bestpublishing.evaluators;

import org.alfresco.web.evaluator.BaseEvaluator;
import org.json.simple.JSONObject;

/**
 * This evaluator checks if the book metadata
 * has been modified after last publishing date.
 *
 * @author martin.bergljung@marversolutions.org
 * @version 1.0
 */
public class CheckMetadataUpdates extends BaseEvaluator {

    @Override
    public boolean evaluate(JSONObject jsonObject) {
        final JSONObject node = (JSONObject) jsonObject.get("node");// get node
        final String isbnNodeRef = (String) node.get("nodeRef");// get noderef of content
        boolean isMetadataUpdated = checkMetadataStatus(isbnNodeRef);
        return isMetadataUpdated;
    }

    /**
     * Call custom Alfresco Repo Web Script and return the metadata status.
     *
     * @param isbnNodeRef
     * @return metadata status
     */
    private boolean checkMetadataStatus(String isbnNodeRef) {
        boolean result = false;

        return result;
        /*
        try {
            final RequestContext rc = ThreadLocalRequestContext.getRequestContext();
            final String userId = rc.getUserId();
            final Connector conn = rc.getServiceRegistry().getConnectorService().
                    getConnector("alfresco", userId, ServletUtil.getSession());
            // call our custom webscript to check metadata
            final String url = "/bestpub/checkMetadataUpdates?nodeRef=" + isbnNodeRef;
            final Response response = conn.call(url);

            if (Status.STATUS_OK == response.getStatus().getCode()) {
                final org.json.JSONObject scriptResponse = new org.json.JSONObject(response.getResponse());
                result = scriptResponse.getBoolean("isMetadataUpdated");
            } else {
                // TODO
            }
        } catch (final ConnectorServiceException e) {
            throw new AlfrescoRuntimeException("Failed to connect repository: " + e.getMessage());
        } catch (final JSONException e) {
            throw new AlfrescoRuntimeException("Failed to parse JSON string: " + e.getMessage());
        }
        return result;
        */
    }
}
