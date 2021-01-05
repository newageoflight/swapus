from fastapi.logger import logger

import asyncio

"""
SSE for notifying users about changes to their groups
Should send out an "update" status message whenever someone in a group changes their preferences
Description of how it should work:
- Something in a group changes (e.g. member removed or added, preferences changed)
- Triggers a SSE saying "cycles updating for group (ID)"
- When the cycles are finished processing it should send out an item saying "cycles updated for group (ID)"
Interestingly this means much of the existing API needs to be reworked
https://sairamkrish.medium.com/handling-server-send-events-with-python-fastapi-e578f3929af1
"""

status_stream_delay = 5 # in s
status_stream_retry_timeout = 30000 # in ms

async def status_event_generator(req):
    # previous_status = None
    while True:
        if await req.is_disconnected():
            logger.debug("[SSE] Request disconnected!")
            break
        
        yield {
            "event": "update",
            "retry": status_stream_retry_timeout,
            "data": ""
        }

        await asyncio.sleep(status_stream_delay)