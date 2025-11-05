#!/usr/bin/env python3

import sys
import getopt
import http.client
import json
from random import randint, choice
from datetime import date
from time import mktime


def usage():
    print('dbFill.py -u <baseurl> -p <port> -n <numUsers> -t <numTasks>')


def main(argv):
    # Defaults (match your local dev)
    baseurl = "localhost"
    port = 3000
    userCount = 50
    taskCount = 200

    try:
        opts, _ = getopt.getopt(argv, "hu:p:n:t:", ["url=", "port=", "users=", "tasks="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt == "-h":
            usage()
            sys.exit()
        elif opt in ("-u", "--url"):
            baseurl = str(arg)
        elif opt in ("-p", "--port"):
            port = int(arg)
        elif opt in ("-n", "--users"):
            userCount = int(arg)
        elif opt in ("-t", "--tasks"):
            taskCount = int(arg)

    # Names
    firstNames = ["james","john","robert","michael","william","david","richard","charles","joseph","thomas","christopher","daniel","paul","mark","donald","george","kenneth","steven","edward","brian","ronald","anthony","kevin","jason","matthew","gary","timothy","jose","larry","jeffrey","frank","scott","eric","stephen","andrew","raymond","gregory","joshua","jerry","dennis","walter","patrick","peter","harold","douglas","henry","carl","arthur","ryan","roger","joe","juan","jack","albert","jonathan","justin","terry","gerald","keith","samuel","willie","ralph","lawrence","nicholas","roy","benjamin","bruce","brandon","adam","harry","fred","wayne","billy","steve","louis","jeremy","aaron","randy","howard","eugene","carlos","russell","bobby","victor","martin","ernest","phillip","todd","jesse","craig","alan","shawn","clarence","sean","philip","chris","johnny","earl","jimmy","antonio","danny","bryan","tony","luis","mike","stanley","leonard","nathan","dale","manuel","rodney","curtis","norman","allen","marvin","vincent","glenn","jeffery","travis","jeff","chad","jacob","lee","melvin","alfred","kyle","francis","bradley","jesus","herbert","frederick","ray","joel","edwin","don","eddie","ricky","troy","randall","barry","alexander","bernard","mario","leroy","francisco","marcus","micheal","theodore","clifford","miguel","oscar","jay","jim","tom","calvin","alex","jon","ronnie","bill","lloyd","tommy","leon","derek","warren","darrell","jerome","floyd","leo","alvin","tim","wesley","gordon","dean","greg","jorge","dustin","pedro","derrick","dan","lewis","zachary","corey","herman","maurice","vernon","roberto","clyde","glen","hector","shane","ricardo","sam","rick","lester","brent","ramon","charlie","tyler","gilbert","gene"]
    lastNames  = ["smith","johnson","williams","jones","brown","davis","miller","wilson","moore","taylor","anderson","thomas","jackson","white","harris","martin","thompson","garcia","martinez","robinson","clark","rodriguez","lewis","lee","walker","hall","allen","young","hernandez","king","wright","lopez","hill","scott","green","adams","baker","gonzalez","nelson","carter","mitchell","perez","roberts","turner","phillips","campbell","parker","evans","edwards","collins","stewart","sanchez","morris","rogers","reed","cook","morgan","bell","murphy","bailey","rivera","cooper","richardson","cox","howard","ward","torres","peterson","gray","ramirez","james","watson","brooks","kelly","sanders","price","bennett","wood","barnes","ross","henderson","coleman","jenkins","perry","powell","long","patterson","hughes","flores","washington","butler","simmons","foster","gonzales","bryant","alexander","russell","griffin","diaz","hayes"]

    # HTTP client
    conn = http.client.HTTPConnection(baseurl, port)
    headers = {"Content-type": "application/json", "Accept": "application/json"}

    userIDs, userNames, userEmails = [], [], []

    # --- Create users ---
    for _ in range(userCount):
        x = randint(0, 99)
        y = randint(0, 99)
        body = {
            "name": f"{firstNames[x]} {lastNames[y]}",
            "email": f"{firstNames[x]}@{lastNames[y]}.com"
        }
        conn.request("POST", "/api/users", json.dumps(body), headers)
        resp = conn.getresponse()
        data = json.loads(resp.read() or "{}")

        if not data or "data" not in data or not data["data"]:
            raise RuntimeError(f"User POST failed: {data}")

        user = data["data"]
        userIDs.append(str(user["_id"]))
        userNames.append(str(user["name"]))
        userEmails.append(str(user["email"]))

    # --- Read task names ---
    with open("tasks.txt", "r", encoding="utf-8") as f:
        taskNames = f.read().splitlines()

    # --- Create tasks ---
    for _ in range(taskCount):
        assigned = (randint(0, 10) > 4)
        assignedUserIndex = randint(0, len(userIDs) - 1) if assigned else -1

        assignedUserID    = userIDs[assignedUserIndex]  if assigned else ""
        assignedUserName  = userNames[assignedUserIndex] if assigned else "unassigned"
        # NOTE: server derives assignedUserName from assignedUser id; we still send both.

        completed = (randint(0, 10) > 5)

        # Integer ms since epoch (NOT a float / string with decimals)
        deadline = int((mktime(date.today().timetuple()) + randint(86400, 864000)) * 1000)

        description = ("It is a long established fact that a reader will be distracted by the readable "
                       "content of a page when looking at its layout. The point of using Lorem Ipsum is "
                       "that it has a more-or-less normal distribution of letters, as opposed to using "
                       "'Content here, content here', making it look like readable English.")

        task_body = {
            "name": choice(taskNames),
            "deadline": deadline,
            "completed": completed,
            "assignedUser": assignedUserID,
            "assignedUserName": assignedUserName,
            "description": description
        }

        conn.request("POST", "/api/tasks", json.dumps(task_body), headers)
        resp = conn.getresponse()
        data = json.loads(resp.read() or "{}")

        if not data or "data" not in data or not data["data"]:
            raise RuntimeError(f"Task POST failed: {data}")

    conn.close()
    print(f"{userCount} users and {taskCount} tasks added at {baseurl}:{port}")


if __name__ == "__main__":
    main(sys.argv[1:])
