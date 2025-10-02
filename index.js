const soap = require("soap");
const dotenv = require("dotenv");
dotenv.config();

const apiUrl = "https://fakturirane.bg/api?wsdl";
(async () => {
  const client = await soap.createClientAsync(apiUrl);
  const eik = process.env.EIK || "000000000";

  const rawHeader = `
  <AuthenticationInfo>
    <username>${process.env.USERNAME}</username>
    <password>${process.env.PASSWORD}</password>
  </AuthenticationInfo>
`;

  client.addSoapHeader(rawHeader);

  const params = {
    xml: `
<document>
  <company>
    <name>Тест ЕООД</name>
    <bulstat>12345678</bulstat>
    <vat_bulstat></vat_bulstat>
    <adress>България, София</adress>
    <mol>Тест Тест</mol>
    <phone></phone>
    <email>test@test.com</email>
  </company>
  <goods>
    <good>
      <title>Абонамент, 10.08.2025 - 09.08.2026</title>
      <type>1</type>
      <price>228.0</price>
      <quantity>1</quantity>
      <vat_included>0</vat_included>
    </good>
  </goods>
  <total_no_vat>228.0</total_no_vat>
  <invoice_tax_amount>45.6</invoice_tax_amount>
  <total>273.6</total>
  <vat_rate>20.0</vat_rate>
  <attend_date>2025-08-25</attend_date>
  <return_value>both</return_value>
  <payment_type>2</payment_type>
  <paid_date>2025-09-01</paid_date>
  <notes>Код за плащане: 173768</notes>
  <mail>
    <from></from>
    <to>test@test.com</to>
    <subject>Проформа фактура за абонамент</subject>
    <message>Здравейте,

Приложено изпращаме проформа фактура номер {{invoice_number}} за Вашия абонамент.

Благодарим Ви, че избрахте нас.</message>
    <attach_document>true</attach_document>
    <header>true</header>
  </mail>
</document>`,
    type: "proform",
    eik,
  };

  try {
    const response = await new Promise((resolve, reject) => {
      client["api.create_document"](params, (err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });

    const [invoiceId, invoiceNumber] = (response.return["$value"] || "").split(
      "::"
    );
    console.log("Invoice ID:", invoiceId);
    console.log("Invoice Number:", invoiceNumber);
  } catch (error) {
    console.error("Error:", error);
  }
})();
