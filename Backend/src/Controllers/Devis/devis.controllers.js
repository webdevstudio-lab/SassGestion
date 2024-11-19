import * as https from '../../constant/https.js';
import prisma from '../../config/prisma.config.js';
import appAssert from '../../Utils/appAssert.js';
import isInDatabase from '../../Utils/IsInDatabase.js';

export const createDevisHandler = async (req, res) => {
  try {
    const request = req.body;
    if (!request.matricule) {
      request.matricule = 'NEAN';
    }
    appAssert(
      request.description,
      https.BAD_REQUEST,
      'le champes description est obligatoire',
    );
    const id = parseInt(req.params.id);
    const date = new Date();
    let year = date.getFullYear();

    //**On verifie si le client existe*/
    const client = await isInDatabase(prisma.client, id);
    appAssert(
      client,
      https.NOT_FOUND,
      "Ce client n'est pas enregistrer dans la base de donnee",
    );

    const num = `DEVIS-${year}_${client.id}/ `;

    // **on recuperer les devis de ce client */
    const clientDev = await prisma.devis.findMany({
      where: { clientId: client.id },
    });

    // Si le client n'a pas de devis on cree le premier devis pour ce clients
    if (clientDev.length === 0) {
      const numDevis = `${num}1`;
      //  **On enregistre le premier devis entreprice*/
      const newDevis = await prisma.devis.create({
        data: {
          numDevis,
          clientId: id,
          matricule: request.matricule.toUpperCase(),
          description: request.description.trim(),
        },
      });
      return res.status(https.CREATED).json({
        message: 'Le devis du client à été créer avec succes!',
        newDevis,
      });
    } else {
      //  Si le client a déja des devis
      //  On recuperer le numero du dernier devis
      const lastDev = await prisma.devis.findMany({
        where: { clientId: client.id },
        orderBy: { createAt: 'desc' },
        select: { numDevis: true },
        take: 1,
      });
      //  **On incremente le dernier numero du derniere devis pour  */
      const numDevis = `${num}${parseInt(lastDev[0].numDevis[lastDev[0].numDevis.length - 1]) + 1}`;
      //  **On cree le devis suivant */
      const nextDevis = await prisma.devis.create({
        data: {
          numDevis,
          clientId: id,
          matricule: request.matricule.toUpperCase(),
          description: request.description.trim(),
        },
      });
      return res.status(https.CREATED).json({
        message: 'Le devis du client à été créer avec succes!',
        nextDevis,
      });
    }
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllDevisHandler = async (req, res) => {
  try {
    const devis = await prisma.devis.findMany({
      orderBy: { createAt: 'desc' },
      include: {
        devisItem: {
          select: {
            description: true,
            quantity: true,
            unitePrice: true,
            total: true,
          },
        },
        clientDevis: {
          select: {
            name: true,
            phone: true,
            email: true,
            addresse: true,
          },
        },
      },
    });
    if (devis.length === 0) {
      return res.status(https.NOT_FOUND).json({
        message: 'Aucun devis dans la base de donnée!',
      });
    }
    return res.status(https.OK).json({ devis });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getDevisHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce devis n'existe pas");
    //**On verifie si le devis existe */
    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        devisItem: {
          select: {
            itemId: true,
            description: true,
            quantity: true,
            unitePrice: true,
            total: true,
          },
        },
        clientDevis: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            addresse: true,
          },
        },
      },
    });
    if (!devis) {
      return res.status(https.NOT_FOUND).json({
        message: "Ce devis n'est pas enregistrer dans la base de donnee",
      });
    }
    return res.status(200).json({ success: true, devis });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateDevisHandler = async (req, res) => {
  try {
    const request = req.body;
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce devis n'existe pas");
    //on verifie si le devis existe!
    const devis = await prisma.devis.findUnique({
      where: { id },
    });
    appAssert(
      devis,
      https.NOT_FOUND,
      "Ce devis n'est pas enregistrer dans la base de donnee",
    );

    //On met a jour le devis
    const updatedevis = await prisma.devis.update({
      where: { id },
      data: {
        matricule: request.matricule.trim(),
        description: request.description.trim(),
      },
    });
    return res.status(https.OK).json({
      message: 'Le devis a été mis à jours avec success!',
      updatedevis,
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteDevisHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce devis n'existe pas");
    //**on verifie si le devis existe */
    const devis = await prisma.devis.findUnique({
      where: { id },
    });
    appAssert(
      devis,
      https.NOT_FOUND,
      "Ce devis n'est pas enregistrer dans la base de donnee",
    );

    //**On supprime le devis */
    await prisma.devis.delete({ where: { id } });
    return res
      .status(https.OK)
      .json({ message: 'Devis supprimer avec succes!' });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
