export class RealtimeLlmEventParser {
    sessionState;
    constructor() {
        this.sessionState = {
            sessionDetails: null,
            conversation: {
                items: new Map(),
            },
            responses: new Map(),
        };
    }
    // Main entry point for processing events
    handleEvent(c, event, sessionOptions) {
        switch (event.type) {
            case 'session.created':
                this.handleSessionCreated(c, event, sessionOptions);
                break;
            case 'session.updated':
                this.handleSessionUpdated(c, event, sessionOptions);
                break;
            case 'conversation.item.created':
                this.handleConversationItemCreated(c, event);
                break;
            case 'conversation.item.deleted':
                this.handleConversationItemDeleted(c, event);
                break;
            case 'response.done':
                this.handleResponseDone(c, event, sessionOptions);
                break;
            case 'error':
                this.handleError(c, event, sessionOptions);
                break;
            default:
                break;
        }
    }
    // Handle `session.created` event
    handleSessionCreated(c, data, sessionOptions) {
        this.sessionState.sessionDetails = { ...data.session };
        const realtimeEventParser = c.get('realtimeEventParser');
        if (realtimeEventParser) {
            c.executionCtx.waitUntil(realtimeEventParser(c, sessionOptions, {}, { ...data.session }, data.type));
        }
    }
    // Handle `session.updated` event
    handleSessionUpdated(c, data, sessionOptions) {
        this.sessionState.sessionDetails = { ...data.session };
        const realtimeEventParser = c.get('realtimeEventParser');
        if (realtimeEventParser) {
            c.executionCtx.waitUntil(realtimeEventParser(c, sessionOptions, {}, { ...data.session }, data.type));
        }
    }
    // Conversation-specific handlers
    handleConversationItemCreated(c, data) {
        const { item } = data;
        this.sessionState.conversation.items.set(item.id, data);
    }
    handleConversationItemDeleted(c, data) {
        this.sessionState.conversation.items.delete(data.item_id);
    }
    handleResponseDone(c, data, sessionOptions) {
        const { response } = data;
        this.sessionState.responses.set(response.id, response);
        for (const item of response.output) {
            const inProgressItem = this.sessionState.conversation.items.get(item.id);
            this.sessionState.conversation.items.set(item.id, {
                ...inProgressItem,
                item,
            });
        }
        const realtimeEventParser = c.get('realtimeEventParser');
        if (realtimeEventParser) {
            const itemSequence = this.rebuildConversationSequence(this.sessionState.conversation.items);
            c.executionCtx.waitUntil(realtimeEventParser(c, sessionOptions, {
                conversation: {
                    items: this.getOrderedConversationItems(itemSequence).slice(0, -1),
                },
            }, data, data.type));
        }
    }
    handleError(c, data, sessionOptions) {
        const realtimeEventParser = c.get('realtimeEventParser');
        if (realtimeEventParser) {
            c.executionCtx.waitUntil(realtimeEventParser(c, sessionOptions, {}, data, data.type));
        }
    }
    rebuildConversationSequence(items) {
        const orderedItemIds = [];
        // Find the first item (no previous_item_id)
        let currentId = Array.from(items.values()).find((data) => data.previous_item_id === null)?.item?.id;
        // Traverse through the chain using previous_item_id
        while (currentId) {
            orderedItemIds.push(currentId);
            const nextItem = Array.from(items.values()).find((data) => data.previous_item_id === currentId);
            currentId = nextItem?.item?.id;
        }
        return orderedItemIds;
    }
    getOrderedConversationItems(sequence) {
        return sequence.map((id) => this.sessionState.conversation.items.get(id));
    }
}
