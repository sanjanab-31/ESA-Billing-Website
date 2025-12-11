export const convertToWords = (num) => {
  if (num === 0) return "Zero";
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n) => {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str.trim();
  };

  let number = Math.floor(num);
  const fraction = Math.round((num - number) * 100);
  let words = "";

  if (number > 9999999) {
    words += inWords(Math.floor(number / 10000000)) + " Crore ";
    number %= 10000000;
  }
  if (number > 99999) {
    words += inWords(Math.floor(number / 100000)) + " Lakh ";
    number %= 100000;
  }
  if (number > 999) {
    words += inWords(Math.floor(number / 1000)) + " Thousand ";
    number %= 1000;
  }
  if (number > 0) {
    words += inWords(number);
  }

  if (fraction > 0) {
    words += " and " + inWords(fraction) + " Paise";
  }

  return "Indian Rupees " + words.trim() + " Only";
};

export const generateInvoiceHTML = (invoice, settings) => {
  // Calculate totals if not present
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const cgstAmount = (subtotal * (invoice.cgst || 0)) / 100;
  const sgstAmount = (subtotal * (invoice.sgst || 0)) / 100;
  const igstAmount = (subtotal * (invoice.igst || 0)) / 100;
  const total = subtotal + cgstAmount + sgstAmount + igstAmount;
  const roundOffAmount = invoice.isRoundOff ? Math.round(total) - total : 0;
  const finalTotal = invoice.isRoundOff ? Math.round(total) : total;

  const amountInWords = convertToWords(finalTotal);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #fff; font-size: 12px; }
        .container { border: 2px solid black; padding: 0; width: 100%; max-width: 800px; margin: auto; box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 4px; border: 1px solid black; }
        .no-border { border: none; }
        .header-top { display: flex; justify-content: space-between; padding: 5px 10px; font-weight: bold; font-size: 12px; border-bottom: none; }
        .header-main { text-align: center; padding: 10px; border-bottom: 1px solid black; }
        .logo-section { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .company-name { font-family: 'Times New Roman', serif; font-size: 26px; font-weight: bold; color: #FF0000; margin: 0; text-transform: uppercase; }
        .company-details { font-size: 12px; margin-top: 5px; line-height: 1.4; }
        .invoice-title { text-align: center; font-weight: bold; font-size: 18px; padding: 5px; border-bottom: 1px solid black; background-color: transparent; }
        .items-table th { text-align: center; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .footer-text { text-align: center; font-weight: bold; font-size: 12px; padding: 5px; border-top: 1px solid black; }
        .bank-details-row td { border: 1px solid black; }
        .declaration-section { font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Phone Numbers -->
        <div class="header-top">
          <div>☎ 98432 94464</div>
          <div>☎ 96984 87096</div>
        </div>

        <!-- Main Header -->
        <div class="header-main">
          <div class="logo-section">
            <img src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png" alt="ESA Logo" style="height: 60px;">
            <div>
              <h1 class="company-name">ESA ENGINEERING WORKS</h1>
              <div class="company-details">
                <div>All Kinds of Lathe and Milling Works</div>
                <div style="margin: 3px 0; font-size: 11px;">Specialist in : Press Tools, Die Casting Tools, Precision Components</div>
                <div>1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</div>
                <div>E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Title -->
        <div style="display: flex; border-bottom: 1px solid black;">
          <div style="width: 20%; border-right: 1px solid black; padding: 5px; display: flex; align-items: center;">
            NO : <span style="margin-left: 5px;">${invoice.invoiceNumber}</span>
          </div>
          <div style="width: 60%; text-align: center; font-weight: bold; font-size: 20px; padding: 5px;">
            INVOICE
          </div>
          <div style="width: 20%; border-left: 1px solid black; padding: 5px; display: flex; align-items: center;">
            DATE : <span style="margin-left: 5px;">${invoice.invoiceDate}</span>
          </div>
        </div>

        <!-- Client & Invoice Details -->
        <div style="display: flex; border-bottom: 1px solid black;">
          <div style="width: 70%; border-right: 1px solid black; padding: 5px;">
            <div>To, M/s,</div>
            <div style="margin-left: 20px; font-weight: bold;">${invoice.client?.name || ""}</div>
            <div style="margin-left: 20px; height: 40px;">${invoice.client?.address || ""}</div>
            <div style="margin-top: 5px;">GSTIN : ${invoice.client?.gst || ""}</div>
          </div>
          <div style="width: 30%;">
            <div style="padding: 5px; border-bottom: 1px solid black; height: 20px;">J.O. No : ${invoice.poNumber || ""}</div>
            <div style="padding: 5px; border-bottom: 1px solid black; height: 20px;">D.C. No : ${invoice.dcNumber || ""}</div>
            <div style="padding: 5px; height: 20px;">D.C. Date : ${invoice.dcDate || ""}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table" style="border-bottom: 1px solid black;">
          <thead>
            <tr>
              <th style="width: 5%;">S.No.</th>
              <th style="width: 45%;">PARTICULARS</th>
              <th style="width: 15%;">HSN CODE</th>
              <th style="width: 10%;">QTY.</th>
              <th style="width: 10%;">RATE</th>
              <th style="width: 15%;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.description}</td>
                <td class="text-center">${item.hsnCode || ""}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${item.rate}</td>
                <td class="text-right">${item.amount}</td>
              </tr>
            `).join("")}
            ${new Array(Math.max(0, 12 - (invoice.items?.length || 0))).fill(
    `<tr>
                <td style="height: 20px;">&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`
  ).join("")}
          </tbody>
        </table>

        <!-- Footer Section -->
        <table style="border-top: none;">
          <tr>
            <td style="width: 15%; border-right: none;">Bank Details :</td>
            <td style="width: 55%; border-left: none;">Bank Name : State Bank Of India</td>
            <td style="width: 15%;">SUB TOTAL</td>
            <td style="width: 15%; text-right;">${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: none; border-bottom: none;">
              <span style="display: inline-block; width: 80px;">&nbsp;</span>
              A/C No : 42455711572
            </td>
            <td>CGST &nbsp;&nbsp;&nbsp;&nbsp; ${invoice.cgst || 0}%</td>
            <td class="text-right">${cgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: none; border-bottom: none;">
              <span style="display: inline-block; width: 80px;">&nbsp;</span>
              IFSC Code : SBIN0015017
            </td>
            <td>SGST &nbsp;&nbsp;&nbsp;&nbsp; ${invoice.sgst || 0}%</td>
            <td class="text-right">${sgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: none;">
              <span style="display: inline-block; width: 80px;">&nbsp;</span>
              Branch : Malumichampatti
            </td>
            <td>IGST &nbsp;&nbsp;&nbsp;&nbsp; ${invoice.igst || 0}%</td>
            <td class="text-right">${igstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="font-weight: bold;">Rupees : <span style="font-weight: normal;">${amountInWords}</span></td>
            <td>ROUND OFF</td>
            <td class="text-right">${roundOffAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" rowspan="2" style="vertical-align: top;">
              <div class="font-bold" style="margin-bottom: 5px;">Declaration</div>
              <div style="font-size: 11px;">We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct</div>
            </td>
            <td class="font-bold">NET TOTAL</td>
            <td class="text-right font-bold">${finalTotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="height: 60px; vertical-align: bottom; text-align: right;">
              <div style="font-weight: bold; color: #FF0000; margin-bottom: 30px;">For ESA Engineering Works</div>
              <div style="font-size: 10px;">Authorized Signatory</div>
            </td>
          </tr>
        </table>

        <div class="footer-text">This is a Computer generated bill</div>
      </div>
    </body>
    </html>
  `;
};
