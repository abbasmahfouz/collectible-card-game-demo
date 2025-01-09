from web3 import Web3
from flask import Flask, Response, make_response, request
import json
import time
import random

BLOCKCHAIN_URL = 'http://127.0.0.1:8545'
ABI_PATH = '../frontend/src/abis/Main.json'
CONTRACT_INFO_PATH = '../frontend/src/contracts.json'
CALLER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
LOCK = False

w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_URL))

def set_contract():

	with open(CONTRACT_INFO_PATH,'r') as file:
		contract_info = json.load(file)

	abi = contract_info["contracts"]["Main"]["abi"]
	address = contract_info["contracts"]["Main"]["address"]
	contract = w3.eth.contract(address=address, abi=abi)
	return contract

contract = set_contract()


#template for calling transaction
def call_function(func_name,arg_list=[], value=0):
	global LOCK
	if (LOCK == True):
		time.sleep(random.randint(3,15))
	LOCK = True
	nonce = w3.eth.get_transaction_count(CALLER)
	chain_id = w3.eth.chain_id

	functionCall = "contract.functions."+func_name+"("
	for arg in arg_list:
		functionCall+=str(arg)+","

	if len(arg_list)>0:
		functionCall=functionCall[:-1]+").build_transaction({\"value\": value,\"gasPrice\": w3.eth.gas_price, \"chainId\":chain_id, \"from\":CALLER,\"nonce\":nonce})"
	else:
		functionCall+=").build_transaction({\"value\": value,\"chainId\":chain_id, \"from\":CALLER,\"nonce\":nonce})"

	signed_tx = w3.eth.account.sign_transaction(eval(functionCall),private_key=PKEY)
	send_tx = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
	tx_receipt = w3.eth.wait_for_transaction_receipt(send_tx)
	LOCK = False
	return tx_receipt


app = Flask(__name__)

#Make sure data formatted same way front/back
#then use call_function to do transaction
@app.route("/createCollection",methods=['POST'])
def createCollection():
	print(request.form["colName"])
	#TODO: Checks on argument type
	args = []
	args.append("\""+request.form["colName"]+"\"")
	args.append("\""+request.form["colURI"]+"\"")
	args.append(str(request.form["colCount"]))

	#TODO: add try/catch to format response

	chainResp = call_function("createCollection",args)
	colID= (contract.events.CollectionCreated.create_filter(from_block="latest").get_new_entries()[0]["args"]['collectionId'])

	resp = make_response(str(colID))
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/createCard",methods=['POST'])
def createCard():
	args = []
	args.append("\""+CALLER+"\"") 
	args.append("\""+request.form["tokenURI"]+"\"") 
	args.append(request.form["collectionId"])
	print(request.form["tokenURI"])
	call_function("mintNFTCard",args)
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/createBooster",methods=['POST'])
def createBooster():
	args = []
	args.append("\""+CALLER+"\"") 
	args.append("\""+request.form["boosterName"]+"\"")
	args.append(request.form["colId"])
	# print(request.form["cards"])
	args.append("["+request.form["cards"]+"]")
	call_function("createBooster",args)
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

# @app.route("/sellBooster",methods=['POST'])
# def sellBooster():
# 	args = []
# 	args.append("\""+request.form["buyer"]+"\"")
# 	args.append(request.form["boosterId"])
# 	state = contract.functions.getState(request.form["buyer"],int(request.form["boosterId"])).call()
# 	print(state)
# 	ret=call_function("sellBooster",args,10000000000000000000)
# 	print(contract.functions.getState(request.form["buyer"],int(request.form["boosterId"])).call())

# 	resp = make_response("OK")
# 	resp.headers['Access-Control-Allow-Origin'] = '*'
# 	return resp

@app.route("/listCard",methods=['POST'])
def listBooster():
	args=[]
	args.append(request.form["colId"])
	args.append(request.form["cardId"])
	args.append(request.form["price"])
	call_function("listCard",args)
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp	

@app.route("/sellCard",methods=['POST'])
def sellCard():
	args = []
	cardId = request.form["cardId"]
	colId = request.form["colId"]
	buyer = request.form["buyer"]
	price = request.form["price"]
	args.append("\""+buyer+"\"")
	args.append(colId)
	args.append(cardId)
	call_function("sellCard",args,int(price))
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp	

@app.route("/sellFromBooster",methods=['POST'])
def sellBooster():
	args =[]
	cardId = request.form["cardId"]
	colId = request.form["colId"]
	buyer = request.form["buyer"]
	args.append("\""+buyer+"\"")
	args.append(colId)
	args.append(cardId)
	call_function("sellCard",args)
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/getBoosters",methods=['GET'])
def getBoosters():
	res = contract.functions.getBoosters.call()
	resp = make_response(res)
	print("BOOSTERS: "+res)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/getCollections",methods=['GET'])
def getCollections():
	res = contract.functions.getCollections.call()
	print(res)
	# resp = make_response(json.loads(res))
	resp = make_response(res)
	# resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/getCollectionCards",methods=['GET'])
def getCollectionCards():
	colId = request.args.get('colId')
	colCards = contract.functions.getCardsByCollection(int(colId)).call()
	print(colCards)
	resp = make_response(colCards)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/mintCard",methods=['POST'])
def mintCard():
	received_args=request.form
	
	collectionId = contract.functions.getCollectionIdFromURI(received_args["collectionId"]).call()

	#TODO: Checks on argument type
	args = []
	args.append("\""+received_args["address"]+"\"") 
	args.append("\""+received_args["tokenURI"]+"\"") 
	args.append(str(collectionId))

	#TODO: add try/catch to format response

	call_function("mintNFTCard",args)
	resp = make_response("OK")
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

#Basic way of calling view function
@app.route("/getCollectionNames",methods=['GET'])
def getCollectionNames():
	collectionNames = contract.functions.getCollectionNames().call()
	ret = {}
	counter = 0
	for n in collectionNames:
		ret[counter] = n
		counter+=1
	resp = make_response(ret)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

#Basic way of calling view function
@app.route("/getAllCollections",methods=['GET'])
def getAllCollections():
	allCollectionNames = contract.functions.getCollectionNames().call()
	print(allCollectionNames)
	collection_dict = {}
	allCardURIs=[]
	for c in allCollectionNames:
		collection_item = {}
		collection_item["cards"]=[]
		cards = contract.functions.getCardsFromCollectionName(c).call()
		chainIDs = contract.functions.getCollectionURIFromName(c).call()
		collection_card = {}
		for i in range(len(cards[0])):
			collection_card["uri"] = cards[1][i]
			allCardURIs.append(cards[1][i])
			collection_card["chain-id"] = cards[0][i]
			collection_item["cards"].append(collection_card)
		# print(chainIDs)
		collection_item["uri"] = chainIDs
		collection_dict[c] =  collection_item
	# counter = 0
	# for n in collectionNames:
	# 	ret[counter] = n
	# 	counter+=1
	collection_dict["all-card-URIs"] = allCardURIs 
	resp = make_response(collection_dict)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

@app.route("/getUsers")
def getUsers():
	users = contract.functions.getUsers().call()
	ret = {}
	for i in range(len(users)):
		ret_object = {}
		ret_object["address"] = users[i]
		ret_object["cards"] = contract.functions.getUserCards(users[i]).call()
		ret[i] = ret_object

	# print(users)
	resp = make_response(ret)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp 

@app.route("/getCollectionURIs")
def getCollectionURIS():
	allCollectionURIs = contract.functions.getCollectionURIs().call()
	resp = make_response(allCollectionURIs)
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp

# @app.route("/createBooster", methods=['POST'])
# def createBooster():
# 	received_args = request.form
# 	colName = received_args["collectionName"]
# 	colCards = received_args["cards"]
# 	cardCount = len(colCards.split(","))

	

# 	resp = make_response("OK")
# 	resp.headers['Access-Control-Allow-Origin'] = '*'
# 	return resp

