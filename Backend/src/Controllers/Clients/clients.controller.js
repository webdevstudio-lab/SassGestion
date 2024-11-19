import prisma from '../../config/prisma.config.js';
import appAssert from '../../Utils/appAssert.js';
import * as https from '../../constant/https.js';

export const createClientHandler = async (req, res) => {
  try {
    const { name, phone, email, addresse } = req.body;
    appAssert(
      name && phone && email && addresse,
      https.BAD_REQUEST,
      "Merci de renseigner tous les champs, pour les champs email et addersse vous pouvez entrer la mention NEAN en cas d'indisponibilité des information",
    );

    const data = [
      name.toUpperCase().trim(),
      phone.trim(),
      email.trim(),
      addresse.trim(),
    ];
    //On verifie si le client n'existe pas
    const client = await prisma.client.findFirst({
      where: { phone: data[1] },
    });
    appAssert(
      !client,
      https.CONFLICT,
      'Un client avec ce numero de telephone existe deja!',
    );

    //**On enregistre le client dans la base de donnée */
    const newclient = await prisma.client.create({
      data: {
        name: data[0],
        phone: data[1],
        email: data[2],
        addresse: data[3],
      },
    });

    return res.status(https.CREATED).json({
      message: 'Le client a ete cree avec success',
      client: newclient,
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllClientHandler = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createAt: 'desc' },
      include: {
        devis: {
          orderBy: { createAt: 'desc' },
          select: {
            numDevis: true,
            total: true,
          },
        },
        facture: {
          orderBy: { createAt: 'desc' },
          select: {
            numFacture: true,
            total: true,
          },
        },
      },
    });
    appAssert(
      clients.length > 0,
      https.NOT_FOUND,
      'Aucun client enregistrer dans la base de donnee',
    );
    res.status(https.OK).json({ clients });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getClientHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id) && id, https.BAD_REQUEST, "Ce client n'existe pas");
    const client = await prisma.client.findUnique({
      where: {
        id,
      },
      include: {
        devis: {
          orderBy: { createAt: 'desc' },
          select: {
            numDevis: true,
            total: true,
          },
        },
        facture: {
          orderBy: { createAt: 'desc' },
          select: {
            numFacture: true,
            total: true,
          },
        },
      },
    });
    appAssert(
      client,
      https.NOT_FOUND,
      "Cet client n'est pas enregistrer dans la base de donnee",
    );

    res.status(https.OK).json({ client });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateClientHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id) && id, https.BAD_REQUEST, "Ce client n'existe pas");
    const client = await prisma.client.findUnique({
      where: { id },
    });
    appAssert(
      client,
      https.NOT_FOUND,
      "Cet client n'est pas enregistrer dans la base de donnee",
    );
    const request = req.body;

    appAssert(
      request.phone,
      https.BAD_REQUEST,
      'Le numero de telephone est obligatoire',
    );

    //on verifie si le numero du client est unique
    const verifPhone = request.phone === client.phone;
    if (!verifPhone) {
      //**On verifie si le nouveau numero n'existe pas déja */
      const verifclient = await prisma.client.findUnique({
        where: { phone: request.phone },
      });
      if (verifclient) {
        return res.status(https.CONFLICT).json({
          message: 'Ce numero de telephone est utilisé par un autre client!',
        });
      }
    }

    //**On met a jour les infprmation dans la base de donnée */
    const updateclient = await prisma.client.update({
      where: { id },
      data: {
        name: request.name.toUpperCase().trim(),
        phone: request.phone.trim(),
        email: request.email.trim(),
        addresse: request.addresse.trim(),
        type: request.type.trim(),
      },
    });
    res.status(https.OK).json({
      message: 'Le client a ete mis à jour avec success',
      client: updateclient,
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteClientHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id) && id, https.BAD_REQUEST, "Ce client n'existe pas");
    const client = await prisma.client.findUnique({
      where: { id },
    });
    appAssert(
      client,
      https.NOT_FOUND,
      "Cet client n'est pas enregistrer dans la base de donnee",
    );
    await prisma.client.delete({ where: { id } });
    res.status(https.OK).json({
      message: 'Le client a ete supprimer avec success',
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
