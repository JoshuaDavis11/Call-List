//Global Variables
var handlers = {};
var selectedLoanOwner;
var caretUpClassName = 'fa fa-caret-up';
var caretDownClassName = 'fa fa-caret-down';
var unsorted = [];
var dates = [];
let uniCode = "";
let filterLastPay = false;

let todaysDate;
let yearMonthDay;

function onStart() {
	handlers.init_task = function () {
		todaysDate = getTodayDateDayFirst();
		yearMonthDay = getTodayDate();

		handlers.getAllActiveLoans();
	};
	//Initialize listener
	ZOHO.embeddedApp.on("PageLoad", handlers.init_task);
	//Widget App Init - Load all configurations
	ZOHO.embeddedApp.init().then(function () { });
};

//Get All Loans
handlers.getAllActiveLoans = function () {
	//CSS
	document.getElementById("loanCallTable").style.display = "block";
	document.getElementById("ownerFilter");
	$("#loanCallTable tbody tr").remove();

	var retry_attempt = 0;
	var totalLoans = 0;
	var count_req = {
		url: "[Redacted]",
		params: {
			query: "SELECT COUNT(id) as 'Total' from Loans WHERE Arrears_Amount > 0 AND Owner != '[Redacted]'"
		}
	};

	async function fetchData() {
		try {
			const countResponse = await ZOHO.CRM.HTTP.post(count_req);
			totalLoans = JSON.parse(JSON.parse(countResponse).details.output).data[0].Total;
			var loop = parseInt(totalLoans) / 200;
			console.log(totalLoans)
			for (let i = 0; i < loop; i++) {
				var querystring = "SELECT Name, Full_Name, Mobile, Work_Phone, Is_Payer, Payment_Arrangement_In_Place AS 'Payment_Arrangement_In_Place', Arrears_Amount AS 'Arrears_Amount', Current_Balance AS 'Current_Balance', Last_Repayment_Received AS 'Last_Repayment_Received', Next_Action_Date, Call_Total AS 'Call_Total', Contact_Total AS 'Contact_Total', Owner, Contact_Name.Residential_State AS State, Legal_Team_Member, Tag, Account_Status as CurrentStatus,Representative_Active,Representative_Phone,Representative_First_Name,Representative_Last_Name from Loans WHERE Arrears_Amount > 0 AND Owner != '[Redacted]' limit  " + (retry_attempt * 200) + ",200";

				var req_data = {
					url: "[Redacted]",
					params: {
						query: querystring
					}
				};
				const response = await ZOHO.CRM.HTTP.post(req_data);
				const dataArray = JSON.parse(JSON.parse(response).details.output).data;
				dataArray.forEach(obj => {
					unsorted.push(obj);
				});

				retry_attempt++;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}
	// very useful tip, () => after .then forces javascript to wait for data to return and then proceeds with the code in the .then
	// javascript tries to resolve function parameters at runtime,
	fetchData()
		//.then(() => console.log(unsorted))
		//.then(() => LoggingFunction())
		.then(() => PopulateTableData())
		.then(() => filterOwner())






	//Populate Table
	function PopulateTableData() {
		unsorted.sort((a, b) => {
			const dateA = new Date(Date.parse(a.Next_Action_Date));
			const dateB = new Date(Date.parse(b.Next_Action_Date));
			return dateA.getTime() - dateB.getTime();
		});

		for (let i = 0; i < unsorted.length; i++) {
			let name = unsorted[i].Full_Name;

			if (unsorted[i].Representative_Active) {

				mobile =
					"<td style='color:blue;'><div class='tooltip' style='opacity: 100;'>" + unsorted[i].Mobile + "<span class='tooltiptext' style='color:white;background-color:black;padding-left:10px;padding-right:10px'>"
					+ unsorted[i].Representative_First_Name + " " + unsorted[i].Representative_Last_Name
					+ "</span></div></td>"
			}
			if (!unsorted[i].Representative_Active) {
				mobile = "<td>" + unsorted[i].Mobile + "</td>"
			}

			let workPhone = unsorted[i].Work_Phone
			let dataArrayState = ""
			if (workPhone == null) workPhone = "";
			if (mobile == null) mobile = "";
			let currentstatus = unsorted[i].CurrentStatus;
			let isPayer = "";
			if (unsorted[i].Is_Payer == true) {
				isPayer = "<p style=\"color:green;\">&#10004</p>";
			}
			else if (unsorted[i].Is_Payer == false) {
				isPayer = "<p style=\"color:red;\">&#10006</p>";
			}
			let arrangement = "";
			if (unsorted[i].Payment_Arrangement_In_Place == true) {
				arrangement = "<p style=\"color:green;\">&#10004</p>";

			}
			else if (unsorted[i].Payment_Arrangement_In_Place == false) {
				arrangement = "<p style=\"color:red;\">&#10006</p>";
			}
			let arrears = unsorted[i].Arrears_Amount.toLocaleString('en-AU', { currency: 'AUD', style: 'currency' });
			let balance = unsorted[i].Current_Balance.toLocaleString('en-AU', { currency: 'AUD', style: 'currency' });
			let lastPayment = "";
			if (unsorted[i].Last_Repayment_Received != null) {
				let Payment = new Date(Date.parse(unsorted[i].Last_Repayment_Received));
				lastPayment = Payment.toLocaleDateString('en-GB');
			}
			let nextAction = "";
			if (unsorted[i].Next_Action_Date != null) {
				let Action = new Date(Date.parse(unsorted[i].Next_Action_Date));
				nextAction = Action.toLocaleDateString('en-GB');
			}
			let callTotal = 0;
			if (unsorted[i].Call_Total != null) {
				callTotal = unsorted[i].Call_Total;
			}
			let contactTotal = 0;
			if (unsorted[i].Contact_Total != null) {
				contactTotal = unsorted[i].Contact_Total;
			}

			let ownerName = ""
			if (unsorted[i].Legal_Team_Member != null) {
				if (unsorted[i].Legal_Team_Member.id == "[Redacted]") {
					ownerName = "[Redacted]";
				}
			}
			else if (unsorted[i].Owner.id == "[Redacted]") {
				ownerName = "[Redacted]";
			}
			else if (unsorted[i].Owner.id == "[Redacted]") {
				ownerName = "[Redacted]";
			}
			else if (unsorted[i].Owner.id == "[Redacted]") {
				ownerName = "[Redacted]";
			}
			else if (unsorted[i].Owner.id == "[Redacted]") {
				ownerName = "[Redacted]";
			}

			if (unsorted[i].State !== null) {
				if (unsorted[i].State.toUpperCase() === "NEW SOUTH WALES") {
					dataArrayState = "NSW";
				} else if (unsorted[i].State.toUpperCase() === "VICTORIA") {
					dataArrayState = "VIC";
				} else if (unsorted[i].State.toUpperCase() === "QUEENSLAND") {
					dataArrayState = "QLD";
				} else if (unsorted[i].State.toUpperCase() === "SOUTH AUSTRALIA") {
					dataArrayState = "SA";
				} else if (unsorted[i].State.toUpperCase() === "WESTERN AUSTRALIA") {
					dataArrayState = "WA";
				} else if (unsorted[i].State.toUpperCase() === "TASMANIA") {
					dataArrayState = "TAS";
				} else if (unsorted[i].State.toUpperCase() === "NORTHERN TERRITORY") {
					dataArrayState = "NT";
				} else if (unsorted[i].State.toUpperCase() === "AUSTRALIAN CAPITAL TERRITORY") {
					dataArrayState = "ACT";
				}
			}
			let loanOwner = ownerName;
			const loanTable = document.getElementsByClassName("loanTableBody")[0];
			let loanTableRow = document.createElement('tr');
			let tempLoanId = unsorted[i].Name;
			let lms = `<a href="[Redacted]" target="_blank"><i class="fa fa-book" style="color: black;"></i></a>`;
			let crm = `<a href="[Redacted]" target="_blank"><i class="fa fa-address-card" style="color: black;"></i></a>`;

			if (unsorted[i].Tag.length != 0) {
				let tagArray = [];
				unsorted[i].Tag.forEach((tag) => tagArray.push(tag.name));
				name += "<div class='tooltip' style='opacity: 100;padding-left: 5px;'>"
					+ "<svg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px' viewBox='0 0 24 24'><path fill='currentColor' fill-rule='evenodd' d='M2.123 12.816c.287 1.003 1.06 1.775 2.605 3.32l1.83 1.83C9.248 20.657 10.592 22 12.262 22c1.671 0 3.015-1.344 5.704-4.033c2.69-2.69 4.034-4.034 4.034-5.705c0-1.67-1.344-3.015-4.033-5.704l-1.83-1.83c-1.546-1.545-2.318-2.318-3.321-2.605c-1.003-.288-2.068-.042-4.197.45l-1.228.283c-1.792.413-2.688.62-3.302 1.233c-.613.614-.82 1.51-1.233 3.302l-.284 1.228c-.491 2.13-.737 3.194-.45 4.197m8-5.545a2.017 2.017 0 1 1-2.852 2.852a2.017 2.017 0 0 1 2.852-2.852m8.928 4.78l-6.979 6.98a.75.75 0 0 1-1.06-1.061l6.978-6.98a.75.75 0 0 1 1.061 1.061' clip-rule='evenodd' /></svg>"
					+ "<span class='tooltiptext' style='padding-left:10px;padding-right:10px;color:white;background-color:black;font-family: 'Rubik', 'Verdana', sans-serif;'>" + tagArray + "</span></div>";

			}



			let newTR = ("<td>" +
				"<div style='display: flex; flex-wrap:nowrap; align-items:center'>" + name + "</div>" +
				"</td>" + mobile + "<td>" + workPhone + "</td><td>" + dataArrayState + "</td><td>" + currentstatus + "</td><td>" + isPayer + "</td><td>" + arrangement +
				"</td><td>" + arrears + "</td><td>" + balance + "</td><td>" + lastPayment + "</td><td>" + nextAction +
				"</td><td>" + callTotal + "</td><td>" + contactTotal + "</td><td>" + loanOwner + "</td><td>" + lms +
				"</td><td>" + crm + "</td>"
			)
			
			loanTableRow.innerHTML = newTR;
			loanTableRow.setAttribute('class', nextAction + " " + loanOwner + " " + unsorted[i].id);
			loanTable.appendChild(loanTableRow);
		}
	}

};

function FilterData() {
	CheckPreviousLoansDue();

	//is payer
	var selectedIsPayer = $('#isPayerSelect').find(":selected").text();
	var selectedIsPayerOption = document.getElementById("isPayerSelect").options[document.getElementById("isPayerSelect").selectedIndex].value;
	// Owner
	var selectedOwnerOption = document.getElementById("lOwner").options[document.getElementById("lOwner").selectedIndex].value;
	//Action date
	var selectedOption = document.getElementById("lOwner").options[document.getElementById("lOwner").selectedIndex].value;
	var resetTable = document.querySelector('.loanTableBody').querySelectorAll('tr');
	for (let i = 0; i < resetTable.length; i++) {
		resetTable[i].style.display = "";
	}

	//Action
	var filteredTable = document.querySelector('.loanTableBody').querySelectorAll('tr');
	var selectedActionDate = $('#nextActionDateSelect').find(":selected").text();

	//payment
	var selectedPaymentArrangement = $('#paymentArrangementSelect').find(":selected").text();
	var selectedPaymentOption = document.getElementById("paymentArrangementSelect").options[document.getElementById("paymentArrangementSelect").selectedIndex].value;

	if (userHasPastDates) {
		var futureLoans = unsorted.filter(loan => loan.Next_Action_Date > yearMonthDay);
		for (let i = 0; i < filteredTable.length; i++) {
			let slicedId = filteredTable[i].className.slice(-17);
			console.log(futureLoans.some(f => f.id == slicedId)) 
			if (futureLoans.some(f => f.id == slicedId)) {
				filteredTable[i].style.display = "none";
			}
		}
	}

	//owner
	for (let i = 0; i < filteredTable.length; i++) {
		if (!filteredTable[i].className.includes(selectedOwnerOption)) {
			filteredTable[i].style.display = "none";
		}
	}

	// action
	if (selectedActionDate != "Next Action Date") {
		for (let i = 0; i < filteredTable.length; i++) {
			if (!filteredTable[i].className.includes(selectedActionDate) || !filteredTable[i].className.includes(selectedOption)) {
				filteredTable[i].style.display = "none";
			}
		}
	}

	//is payer
	let isPayerIndex = MatchStringToBoolean(selectedIsPayerOption);
	$('#paymentArrangementSelect').prop('selectedIndex', isPayerIndex);

	if (selectedIsPayer != "Is Payer") {
		for (let i = 0; i < filteredTable.length; i++) {
			//may need to update cell value  --------------------------------------------------------------------Important---------------------------------------------------
			if (filteredTable[i].cells[5].innerText != uniCode) {
				filteredTable[i].style.display = "none";
			}
		}
	}



	//payment arrangement
	let payArrangementIndex = MatchStringToBoolean(selectedPaymentOption);
	$('#paymentArrangementSelect').prop('selectedIndex', payArrangementIndex);
	if (selectedPaymentArrangement != "Payment Arrangement") {
		for (let i = 0; i < filteredTable.length; i++) {
			//may need to update cell value  --------------------------------------------------------------------Important---------------------------------------------------
			if (filteredTable[i].cells[6].innerText != uniCode) {
				filteredTable[i].style.display = "none";
			}
		}
	}
}





function filterOwner() {
	CheckPreviousLoansDue();
	
	var selectedOption = document.getElementById("lOwner").options[document.getElementById("lOwner").selectedIndex];
	var resetTable = document.querySelector('.loanTableBody').querySelectorAll('tr');
	for (let i = 0; i < resetTable.length; i++) {
		resetTable[i].style.display = "";
	}
	var filteredTable = document.querySelector('.loanTableBody').querySelectorAll('tr');

	if (userHasPastDates) {
		var futureLoans = unsorted.filter(loan => loan.Next_Action_Date > yearMonthDay);
		showAlertToOwner();

		for (let i = 0; i < filteredTable.length; i++) {
			let slicedId = filteredTable[i].className.slice(-17);
			if (futureLoans.some(f => f.id == slicedId)) {
				filteredTable[i].style.display = "none";
			}
		}
	}


	if (selectedOption == "Ana") {
		for (let i = 0; i < filteredTable.length; i++) {
			if (filteredTable.Legal_Team_Member.id !== "[Redacted]") {
				filteredTable[i].style.display = "none";
			}
		}
	}
	else {
		for (let i = 0; i < filteredTable.length; i++) {
			if (!filteredTable[i].className.includes(selectedOption.value)) {
				filteredTable[i].style.display = "none";
			}
		}
	}
	//Reset Next action date and Payment arrangement select boxes
	resetAndPopulateActionDate();
	hideWorkPhone();
	$('#paymentArrangementSelect').prop('selectedIndex', 0);
	$('#isPayerSelect').prop('selectedIndex', 0);

}


function resetAndPopulateActionDate() {
	$('#nextActionDate')
		.find('option')
		.remove()
		.end();
	$('#nextActionDateSelect').append($('<option>', {
		value: "Next Action Date",
		text: "Next Action Date"
	}));

	var selectedOption = document.getElementById("lOwner").options[document.getElementById("lOwner").selectedIndex];
	var hiddenValue = selectedOption.getAttribute("data-hidden-value");

	if (selectedOption.value == "[Redacted]") {
		var selectedOwnerLoans = unsorted.filter(loan => loan.Legal_Team_Member && loan.Legal_Team_Member.id && loan.Legal_Team_Member.id === hiddenValue);
	}
	else if(!userHasPastDates) {
		var selectedOwnerLoans = unsorted.filter(loan => loan.Owner.id == hiddenValue);
	}
	else{
		var selectedOwnerLoans = unsorted.filter(loan => loan.Owner.id == hiddenValue && loan.Next_Action_Date <= yearMonthDay && loan.Legal_Team_Member == null) ;
	}


	selectedOwnerLoans.sort(function (a, b) {
		var keyA = new Date(Date.parse(a.Next_Action_Date));
		var keyB = new Date(Date.parse(b.Next_Action_Date));
		// Compare the 2 dates
		if (keyA < keyB) return -1;
		if (keyA > keyB) return 1;

		return 0;

	});
	dates = []

	for (let i = 0; i < selectedOwnerLoans.length; i++) {
		if ((selectedOwnerLoans[i].Next_Action_Date) != null) {
			if (dates.indexOf(selectedOwnerLoans[i].Next_Action_Date) === -1)
				dates.push(selectedOwnerLoans[i].Next_Action_Date)
		}
	}

	for (let i = 0; i < dates.length; i++) {
		dateString = new Date(Date.parse(dates[i]));
		dateS = dateString.toLocaleDateString('en-GB');
		$('#nextActionDateSelect').append($('<option>', {
			value: dateS,
			text: dateS
		}))
	}
}

//Toggle workphone
document.addEventListener("DOMContentLoaded", function () {
	let checkbox = document.querySelector("#workphone-toggle");
	checkbox.addEventListener('change', function () {
		if (this.checked) {
			ToggleWorkPhone(true);
		} else {
			ToggleWorkPhone(false);
		}
	});
});



//Button listener to change mobile phone to work
function ToggleWorkPhone(checkedOrNot) {
	//work
	var workPhonecolumnIndex = 2; // Index of the work phone column

	//mobile
	var mobilePhoneColumnIndex = 1;

	//table data
	var tableRows = document.querySelector('.loanTableBody').querySelectorAll('tr');
	var headerRow = document.querySelector('.loanTableHeaderRow');

	//work
	var headerCell = headerRow.cells[workPhonecolumnIndex];
	//mobile
	var mobileHeaderCell = headerRow.cells[mobilePhoneColumnIndex];

	if (checkedOrNot) {
		for (let i = 0; i < tableRows.length; i++) {
			var cell = tableRows[i].cells[workPhonecolumnIndex];
			headerCell.style.display = "";
			cell.style.display = "";

			var mobileCell = tableRows[i].cells[mobilePhoneColumnIndex];
			mobileHeaderCell.style.display = "none";
			mobileCell.style.display = "none";
		}
	} else {
		for (let i = 0; i < tableRows.length; i++) {
			var cell = tableRows[i].cells[workPhonecolumnIndex];
			headerCell.style.display = "none";
			cell.style.display = "none";

			var mobileCell = tableRows[i].cells[mobilePhoneColumnIndex];
			mobileHeaderCell.style.display = "";
			mobileCell.style.display = "";
		}
	}
}

function hideWorkPhone() {
	var workPhonecolumnIndex = 2;
	var tableRows = document.querySelector('.loanTableBody').querySelectorAll('tr');
	var headerRow = document.querySelector('.loanTableHeaderRow');
	var headerCell = headerRow.cells[workPhonecolumnIndex];

	for (let i = 0; i < tableRows.length; i++) {
		var cell = tableRows[i].cells[workPhonecolumnIndex];
		headerCell.style.display = "none";
		cell.style.display = "none";
	}

}


function CheckPreviousLoansDue() {

	let matchedItems = [];
	var select = document.getElementById("lOwner");
	var selectedOption = select.options[select.selectedIndex];
	var currentOwner = selectedOption.getAttribute("data-hidden-value");
	if (currentOwner != "[Redacted]") {
		unsorted.forEach(item => {
			if (item.Owner.id == currentOwner && item.Legal_Team_Member == undefined && item.Next_Action_Date <= yearMonthDay) {
				matchedItems.push(item);
			}
		});
		if (matchedItems.length > 0) {
			userHasPastDates = true;
		}
		else {
			userHasPastDates = false;
		}
	}
}

function filterDatesBeforeToday() {
	for (let i = 0; i < unsorted.length; i++) {
		var filteredTable = document.querySelector('.loanTableBody').querySelectorAll('tr');
		if (unsorted[i].Next_Action_Date > getTodayDate()) {
			filteredTable[i].style.display = "none";
		}
	}
}

function getTodayDateDayFirst() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); 
	const day = String(today.getDate()).padStart(2, '0');

	return `${day}/${month}/${year}`;
}

function getTodayDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function MatchStringToBoolean(booleanString) {
	if (booleanString == "true") {
		uniCode = "\u2714";
		return 1;

	}
	else if (booleanString == "false") {
		uniCode = '\u2716'
		return 2;

	}
	else {
		return 0;
	}
}

function showAlertToOwner() {
    // Style the alert message
    const alertStyle = `
        background-color: #FBC02D;
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 24px;
        position: fixed;
        top: 4%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
		border-radius: 25px;
		font-family: "Rubik", "Verdana", sans-serif;
    `;

   
    const alertElement = document.createElement('div');
    alertElement.textContent = 'You have accounts with an overdue next action date';
    alertElement.style.cssText = alertStyle;

    
    document.body.appendChild(alertElement);

    
    setTimeout(() => {
        document.body.removeChild(alertElement);
    }, 10000);
}